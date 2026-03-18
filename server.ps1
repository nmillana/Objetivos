param(
  [int]$Port = 8080
)

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$root = Split-Path -Parent $PSCommandPath

function Load-DotEnv {
  param(
    [string]$Path
  )

  if (-not (Test-Path $Path)) {
    return
  }

  foreach ($line in Get-Content $Path) {
    $entry = $line.Trim()

    if (-not $entry -or $entry.StartsWith("#") -or -not $entry.Contains("=")) {
      continue
    }

    $parts = $entry.Split("=", 2)
    $name = $parts[0].Trim()
    $value = $parts[1].Trim()

    if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
      $value = $value.Substring(1, $value.Length - 2)
    }

    if (-not [string]::IsNullOrWhiteSpace($name) -and -not [Environment]::GetEnvironmentVariable($name, "Process")) {
      [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
  }
}

function Get-DefaultModel {
  if ([string]::IsNullOrWhiteSpace($env:OPENAI_MODEL)) {
    return "gpt-5-mini"
  }

  return $env:OPENAI_MODEL
}

function Resolve-Model {
  param(
    [string]$RequestedModel
  )

  $allowed = @("gpt-5-mini", "gpt-5.2")
  $fallback = Get-DefaultModel

  if ($allowed -contains $RequestedModel) {
    return $RequestedModel
  }

  if ($allowed -contains $fallback) {
    return $fallback
  }

  return "gpt-5-mini"
}

function Read-RequestText {
  param(
    [System.Net.HttpListenerRequest]$Request
  )

  $reader = New-Object System.IO.StreamReader($Request.InputStream, $Request.ContentEncoding)
  try {
    return $reader.ReadToEnd()
  } finally {
    $reader.Dispose()
  }
}

function Write-JsonResponse {
  param(
    [System.Net.HttpListenerResponse]$Response,
    [int]$StatusCode,
    [object]$Payload
  )

  $json = $Payload | ConvertTo-Json -Depth 20
  $bytes = [Text.Encoding]::UTF8.GetBytes($json)
  $Response.StatusCode = $StatusCode
  $Response.ContentType = "application/json; charset=utf-8"
  $Response.ContentEncoding = [Text.Encoding]::UTF8
  $Response.ContentLength64 = $bytes.Length
  $Response.OutputStream.Write($bytes, 0, $bytes.Length)
}

function Get-ContentType {
  param(
    [string]$Path
  )

  switch ([IO.Path]::GetExtension($Path).ToLowerInvariant()) {
    ".html" { return "text/html; charset=utf-8" }
    ".css" { return "text/css; charset=utf-8" }
    ".js" { return "application/javascript; charset=utf-8" }
    ".json" { return "application/json; charset=utf-8" }
    ".svg" { return "image/svg+xml" }
    ".png" { return "image/png" }
    ".jpg" { return "image/jpeg" }
    ".jpeg" { return "image/jpeg" }
    ".ico" { return "image/x-icon" }
    default { return "application/octet-stream" }
  }
}

function Resolve-StaticPath {
  param(
    [string]$RequestPath
  )

  $relativePath = if ([string]::IsNullOrWhiteSpace($RequestPath) -or $RequestPath -eq "/") {
    "index.html"
  } else {
    $RequestPath.TrimStart("/") -replace "/", [IO.Path]::DirectorySeparatorChar
  }

  $fullPath = [IO.Path]::GetFullPath((Join-Path $root $relativePath))
  $rootPath = [IO.Path]::GetFullPath($root)

  if (-not $fullPath.StartsWith($rootPath, [StringComparison]::OrdinalIgnoreCase)) {
    return $null
  }

  return $fullPath
}

function Get-OpenAIResponseText {
  param(
    [object]$OpenAIResponse
  )

  if ($OpenAIResponse.PSObject.Properties.Name -contains "output_text" -and $OpenAIResponse.output_text) {
    return [string]$OpenAIResponse.output_text
  }

  $parts = New-Object System.Collections.Generic.List[string]

  foreach ($item in @($OpenAIResponse.output)) {
    foreach ($content in @($item.content)) {
      if ($content.type -ne "output_text") {
        continue
      }

      if ($content.text -is [string]) {
        [void]$parts.Add([string]$content.text)
        continue
      }

      if ($content.text -and $content.text.PSObject.Properties.Name -contains "value") {
        [void]$parts.Add([string]$content.text.value)
      }
    }
  }

  return ($parts -join "")
}

function Invoke-ObjectiveDraft {
  param(
    [object]$RequestBody
  )

  if ([string]::IsNullOrWhiteSpace($env:OPENAI_API_KEY)) {
    throw "Falta OPENAI_API_KEY. Agrega la clave en tu entorno o en el archivo .env."
  }

  $management = [string]$RequestBody.management
  $areas = [string]$RequestBody.areas
  $strategy = [string]$RequestBody.strategy
  $projects = [string]$RequestBody.projects

  if ([string]::IsNullOrWhiteSpace($management) -or [string]::IsNullOrWhiteSpace($areas) -or [string]::IsNullOrWhiteSpace($strategy) -or [string]::IsNullOrWhiteSpace($projects)) {
    throw "La solicitud de redaccion no incluye todos los datos base requeridos."
  }

  $outcome = if ([string]::IsNullOrWhiteSpace([string]$RequestBody.outcome)) { "No informado" } else { [string]$RequestBody.outcome }
  $constraints = if ([string]::IsNullOrWhiteSpace([string]$RequestBody.constraints)) { "No informadas" } else { [string]$RequestBody.constraints }
  $model = Resolve-Model ([string]$RequestBody.model)

  $prompt = @(
    "Redacta un objetivo sugerido para una gerencia de personas."
    "Usa espanol profesional de Chile, tono ejecutivo, concreto y accionable."
    "Integra criterios START/SMART: especifico, medible, alcanzable, relevante y temporal."
    "El titulo debe ser claro y breve, con un maximo de 16 palabras."
    "La descripcion debe tener un parrafo ejecutivo y luego 3 bullets que expliquen foco, medicion e impacto."
    "Propone entre 3 y 5 KPIs accionables y medibles."
    "Propone 1 hito inicial realista para las primeras 4 a 8 semanas."
    "Propone entre 3 y 6 tags cortos y reutilizables."
    ""
    "Contexto del usuario:"
    "- Gerencia: $management"
    "- Areas: $areas"
    "- Estrategia: $strategy"
    "- Proyectos o iniciativas: $projects"
    "- Impacto esperado: $outcome"
    "- Restricciones o consideraciones: $constraints"
  ) -join "`n"

  $schema = [ordered]@{
    type = "object"
    additionalProperties = $false
    required = @("title", "description", "kpis", "milestone", "tags")
    properties = [ordered]@{
      title = @{
        type = "string"
      }
      description = @{
        type = "string"
      }
      kpis = @{
        type = "array"
        minItems = 3
        maxItems = 5
        items = @{
          type = "string"
        }
      }
      milestone = @{
        type = "string"
      }
      tags = @{
        type = "array"
        minItems = 3
        maxItems = 6
        items = @{
          type = "string"
        }
      }
    }
  }

  $requestPayload = [ordered]@{
    model = $model
    input = $prompt
    text = @{
      format = @{
        type = "json_schema"
        name = "objective_draft"
        strict = $true
        schema = $schema
      }
    }
  }

  $requestJson = $requestPayload | ConvertTo-Json -Depth 20
  $httpRequest = [System.Net.Http.HttpRequestMessage]::new([System.Net.Http.HttpMethod]::Post, "https://api.openai.com/v1/responses")
  $httpRequest.Headers.Authorization = [System.Net.Http.Headers.AuthenticationHeaderValue]::new("Bearer", $env:OPENAI_API_KEY)
  $httpRequest.Content = [System.Net.Http.StringContent]::new($requestJson, [Text.Encoding]::UTF8, "application/json")

  try {
    $httpResponse = $script:HttpClient.SendAsync($httpRequest).GetAwaiter().GetResult()
    $rawResponse = $httpResponse.Content.ReadAsStringAsync().GetAwaiter().GetResult()

    if (-not $httpResponse.IsSuccessStatusCode) {
      $message = "OpenAI devolvio un error."

      try {
        $errorPayload = $rawResponse | ConvertFrom-Json
        if ($errorPayload.error.message) {
          $message = [string]$errorPayload.error.message
        }
      } catch {
        if (-not [string]::IsNullOrWhiteSpace($rawResponse)) {
          $message = $rawResponse
        }
      }

      throw $message
    }

    $responseObject = $rawResponse | ConvertFrom-Json
    $outputText = Get-OpenAIResponseText $responseObject

    if ([string]::IsNullOrWhiteSpace($outputText)) {
      throw "OpenAI no devolvio texto utilizable para el borrador."
    }

    $draft = $outputText | ConvertFrom-Json

    return [ordered]@{
      title = [string]$draft.title
      description = [string]$draft.description
      kpis = @($draft.kpis)
      milestone = [string]$draft.milestone
      tags = @($draft.tags)
      model = $model
      generatedAt = (Get-Date).ToString("s")
    }
  } finally {
    $httpRequest.Dispose()
    if ($httpResponse) {
      $httpResponse.Dispose()
    }
  }
}

function Handle-Health {
  param(
    [System.Net.HttpListenerResponse]$Response
  )

  Write-JsonResponse $Response 200 @{
    available = -not [string]::IsNullOrWhiteSpace($env:OPENAI_API_KEY)
    model = Get-DefaultModel
    mode = "local-powershell-server"
  }
}

function Handle-Draft {
  param(
    [System.Net.HttpListenerRequest]$Request,
    [System.Net.HttpListenerResponse]$Response
  )

  if ($Request.HttpMethod -ne "POST") {
    Write-JsonResponse $Response 405 @{ error = "Metodo no permitido." }
    return
  }

  $bodyText = Read-RequestText $Request

  if ([string]::IsNullOrWhiteSpace($bodyText)) {
    Write-JsonResponse $Response 400 @{ error = "La solicitud llego vacia." }
    return
  }

  try {
    $requestBody = $bodyText | ConvertFrom-Json
  } catch {
    Write-JsonResponse $Response 400 @{ error = "No pude leer el JSON enviado por el frontend." }
    return
  }

  try {
    $draft = Invoke-ObjectiveDraft $requestBody
    Write-JsonResponse $Response 200 $draft
  } catch {
    Write-JsonResponse $Response 500 @{ error = $_.Exception.Message }
  }
}

function Handle-StaticFile {
  param(
    [System.Net.HttpListenerRequest]$Request,
    [System.Net.HttpListenerResponse]$Response
  )

  $filePath = Resolve-StaticPath $Request.Url.AbsolutePath

  if (-not $filePath -or -not (Test-Path $filePath -PathType Leaf)) {
    $Response.StatusCode = 404
    $bytes = [Text.Encoding]::UTF8.GetBytes("Not found")
    $Response.ContentType = "text/plain; charset=utf-8"
    $Response.ContentLength64 = $bytes.Length
    $Response.OutputStream.Write($bytes, 0, $bytes.Length)
    return
  }

  $bytes = [IO.File]::ReadAllBytes($filePath)
  $Response.StatusCode = 200
  $Response.ContentType = Get-ContentType $filePath
  $Response.ContentLength64 = $bytes.Length
  $Response.OutputStream.Write($bytes, 0, $bytes.Length)
}

Load-DotEnv (Join-Path $root ".env")
Add-Type -AssemblyName System.Net.Http
$script:HttpClient = [System.Net.Http.HttpClient]::new()
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()

Write-Host ""
Write-Host "Panel Objetivos listo en http://localhost:$Port" -ForegroundColor Green
Write-Host "Modelo OpenAI por defecto: $(Get-DefaultModel)"
Write-Host "OPENAI_API_KEY cargada: $(-not [string]::IsNullOrWhiteSpace($env:OPENAI_API_KEY))"
Write-Host "Presiona Ctrl + C para detener el servidor."
Write-Host ""

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()

    try {
      $path = $context.Request.Url.AbsolutePath

      switch ($path) {
        "/api/ai/health" {
          Handle-Health $context.Response
          continue
        }
        "/api/ai/objective-draft" {
          Handle-Draft $context.Request $context.Response
          continue
        }
        default {
          Handle-StaticFile $context.Request $context.Response
        }
      }
    } catch {
      if ($context.Response.OutputStream.CanWrite) {
        Write-JsonResponse $context.Response 500 @{ error = $_.Exception.Message }
      }
    } finally {
      try {
        $context.Response.OutputStream.Close()
      } catch {
      }

      try {
        $context.Response.Close()
      } catch {
      }
    }
  }
} finally {
  $listener.Stop()
  $listener.Close()
  $script:HttpClient.Dispose()
}

