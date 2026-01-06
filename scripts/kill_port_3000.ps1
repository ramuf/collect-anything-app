$lines = netstat -ano | Select-String ':3000'
if ($lines) {
  $seen = @{}
  foreach ($line in $lines) {
    $foundPid = ($line.Line -split '\s+')[-1]
    $n = 0
    if ([int]::TryParse($foundPid,[ref]$n) -and $n -gt 0 -and -not $seen.ContainsKey($n)) {
      try {
        Stop-Process -Id $n -Force
        Write-Output ("Stopped PID " + $n)
      } catch {
        Write-Output ("Failed to stop PID " + $n + ": " + $_)
      }
      $seen[$n] = $true
    }
  }
} else {
  Write-Output "No process found on port 3000"
}
