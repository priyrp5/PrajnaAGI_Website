$filePath = 'c:\Users\Dell\Downloads\PrajnaAGI_Website\Index.html'
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

# 1. Add id="cms-featured-card" to the featured-main anchor
$content = $content -replace 'class="clickable-card featured-main">', 'class="clickable-card featured-main" id="cms-featured-card">'

# 2. Add class="featured-title" to the h3 inside featured-content
#    The h3 starts right after <div class="featured-content">
$content = $content -replace '(<div class="featured-content">\s*<span[^>]+>.*?</span>\s*)<h3>', '$1<h3 class="featured-title">'

# 3. Add class="featured-summary" to the p that follows the h3
#    Match the closing </h3> then the opening <p>
$content = $content -replace '(class="featured-title">[\s\S]*?</h3>\s*)<p>', '$1<p class="featured-summary">'

# Save back with UTF-8 (no BOM)
[System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
Write-Host "Done - featured card ID and class hooks applied"
