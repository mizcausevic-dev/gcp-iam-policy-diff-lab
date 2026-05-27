$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$screenshots = Join-Path $root "screenshots"
New-Item -ItemType Directory -Force -Path $screenshots | Out-Null

Add-Type -AssemblyName System.Drawing

function New-ProofImage {
    param(
        [string]$Path,
        [string]$Title,
        [string]$Subtitle,
        [string[]]$Bullets
    )

    $bitmap = New-Object System.Drawing.Bitmap 1600, 1000
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.Clear([System.Drawing.Color]::FromArgb(7, 10, 15))

    $panelBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(11, 18, 32))
    $accentBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(55, 255, 139))
    $altAccentBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(25, 199, 255))
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(233, 243, 255))
    $mutedBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(171, 186, 201))
    $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(42, 111, 88), 2)

    $graphics.FillRectangle($panelBrush, 48, 48, 1504, 904)
    $graphics.DrawRectangle($borderPen, 48, 48, 1504, 904)

    $eyebrowFont = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
    $titleFont = New-Object System.Drawing.Font("Georgia", 34, [System.Drawing.FontStyle]::Bold)
    $bodyFont = New-Object System.Drawing.Font("Segoe UI", 18)
    $bulletFont = New-Object System.Drawing.Font("Segoe UI", 20, [System.Drawing.FontStyle]::Bold)

    $graphics.DrawString("GCP IAM Policy Diff Lab", $eyebrowFont, $accentBrush, 92, 92)
    $graphics.DrawString($Title, $titleFont, $textBrush, 92, 142)
    $graphics.DrawString($Subtitle, $bodyFont, $mutedBrush, 92, 214)

    $y = 320
    foreach ($bullet in $Bullets) {
        $graphics.DrawString("•", $bulletFont, $altAccentBrush, 108, $y)
        $graphics.DrawString($bullet, $bodyFont, $textBrush, 138, $y + 2)
        $y += 82
    }

    $graphics.DrawString("Synthetic proof render for README packaging.", $bodyFont, $mutedBrush, 92, 880)
    $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bitmap.Dispose()
}

New-ProofImage -Path (Join-Path $screenshots "01-overview-proof.png") `
    -Title "Overview proof" `
    -Subtitle "Public bindings, privileged roles, org-policy drift, and stale snapshots in one GCP operator surface." `
    -Bullets @(
        "Public GCS bindings rise before audit or answer-engine surprises hit.",
        "Privileged role drift stays visible instead of buried in JSON snapshots.",
        "Snapshot freshness and org-policy mismatches map directly into cleanup packets."
    )

New-ProofImage -Path (Join-Path $screenshots "02-policy-lane-proof.png") `
    -Title "Policy lane" `
    -Subtitle "Every lane keeps owner, scope, drift focus, status, and next action visible." `
    -Bullets @(
        "Public, basic-role, service-account, and snapshot lanes stay separated cleanly.",
        "Folder inheritance drift remains obvious.",
        "Guardrail cleanup paths are easy to scan."
    )

New-ProofImage -Path (Join-Path $screenshots "03-binding-risks-proof.png") `
    -Title "Binding risks" `
    -Subtitle "Findings map severity, owner, subject, member, and the exact rule that fired." `
    -Bullets @(
        "High-severity public and privileged bindings surface first.",
        "Owner mapping keeps IAM and cloud-governance accountability explicit.",
        "The lane is grounded in GCP IAM snapshot diffs."
    )

New-ProofImage -Path (Join-Path $screenshots "04-drift-posture-proof.png") `
    -Title "Drift posture" `
    -Subtitle "Packets tie completeness, blocker, owner, and cleanup timing together." `
    -Bullets @(
        "Public exposure, role cleanup, and snapshot refresh stay readable.",
        "Red/yellow/green review posture is easy to scan.",
        "The system is shaped for real GCP IAM and org-policy proof."
    )
