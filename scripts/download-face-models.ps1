# Download Face-API.js Models
# Run this script to download the required models for face recognition

$modelUrl = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"
$modelsDir = "public/models"

# Create models directory if it doesn't exist
if (-not (Test-Path $modelsDir)) {
    New-Item -ItemType Directory -Path $modelsDir -Force | Out-Null
    Write-Host "Created models directory" -ForegroundColor Green
}

# List of models to download
$models = @(
    "tiny_face_detector_model-weights_manifest.json",
    "tiny_face_detector_model-shard1",
    "face_landmark_68_model-weights_manifest.json",
    "face_landmark_68_model-shard1",
    "face_recognition_model-weights_manifest.json",
    "face_recognition_model-shard1",
    "face_expression_model-weights_manifest.json",
    "face_expression_model-shard1"
)

Write-Host "Downloading Face-API models..." -ForegroundColor Cyan
Write-Host "This may take a few moments..." -ForegroundColor Yellow

foreach ($model in $models) {
    $url = "$modelUrl/$model"
    $output = Join-Path $modelsDir $model
    
    try {
        Write-Host "Downloading $model..." -NoNewline
        Invoke-WebRequest -Uri $url -OutFile $output -ErrorAction Stop
        Write-Host " Done" -ForegroundColor Green
    }
    catch {
        Write-Host " Failed" -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Face-API models downloaded successfully!" -ForegroundColor Green
Write-Host "Models are located in: $modelsDir" -ForegroundColor Cyan
