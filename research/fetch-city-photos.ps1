$ErrorActionPreference = 'Stop'
$cityQueries = @(
 @{key='milan-duomo';query='Duomo Milano facade'}, @{key='milan-navigli';query='Naviglio Grande Milano -Bernate -Turbigo -Robecchetto'},
 @{key='rome-colosseum';query='Colosseum Rome exterior'}, @{key='rome-pantheon';query='Pantheon Rome Piazza Rotonda exterior'},
 @{key='turin-castello';query='Torino Piazza Castello -Gabinio'}, @{key='turin-mole';query='Mole Antonelliana'},
 @{key='bologna-maggiore';query='Bologna Piazza Maggiore'}, @{key='bologna-porticoes';query='Bologna portico San Luca'},
 @{key='florence-duomo';query='Florence Cathedral panorama'}, @{key='florence-ponte';query='Ponte Vecchio Florence river'},
 @{key='venice-canal';query='Venice Grand Canal Rialto'}, @{key='venice-san-marco';query='Venice Piazza San Marco basilica'},
 @{key='naples-bay';query='Naples panorama Vesuvius'}, @{key='naples-plebiscito';query='Napoli Piazza Plebiscito -Calvi'},
 @{key='genoa-boccadasse';query='Boccadasse Genova panorama'}, @{key='genoa-garibaldi';query='"Via Garibaldi e Palazzo Rosso a Genova, Italia (2007)"'},
 @{key='palermo-cathedral';query='Palermo Cathedral exterior'}, @{key='palermo-quattro';query='Palermo Quattro Canti'},
 @{key='verona-arena';query='Arena Verona exterior Piazza Bra'}, @{key='verona-adige';query='Verona Ponte Pietra panorama'}
)
$cityAssetRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../dist/assets/journal/cities'))
New-Item -ItemType Directory -Path $cityAssetRoot -Force | Out-Null
$cityManifest = @(if(Test-Path (Join-Path $PSScriptRoot 'city-photo-credits.json')){Get-Content (Join-Path $PSScriptRoot 'city-photo-credits.json') -Raw | ConvertFrom-Json} ) | Where-Object {$_.key -ne 'genoa-garibaldi'}
foreach($cityQuery in $cityQueries){
 if($cityManifest.key -contains $cityQuery.key){continue}
 $cityApi='https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=30&prop=imageinfo&iiprop=url%7Cextmetadata%7Csize&iiurlwidth=1280&gsrsearch='+[uri]::EscapeDataString($cityQuery.query)
 $cityResponse=Invoke-RestMethod -Uri $cityApi -UserAgent 'PersiaMarket/1.0 (city journal attribution)'
 $cityCandidates=@($cityResponse.query.pages.PSObject.Properties.Value | Sort-Object index)
 $citySelected=$cityCandidates | Where-Object {$_.imageinfo[0].width -ge 1000 -and ($cityQuery.key -eq 'genoa-garibaldi' -or $_.imageinfo[0].width -ge $_.imageinfo[0].height) -and $_.imageinfo[0].width / $_.imageinfo[0].height -lt 2.3 -and $_.imageinfo[0].extmetadata.LicenseShortName.value -match '^(CC BY|CC0|Public domain)' -and $_.imageinfo[0].url -match '\.(jpg|jpeg|png)(\?|$)'} | Select-Object -First 1
 if(!$citySelected){throw ('No suitable licensed image: '+$cityQuery.key)}
 $cityInfo=$citySelected.imageinfo[0]; $cityMeta=$cityInfo.extmetadata
 $cityUrl=if($cityInfo.thumburl){$cityInfo.thumburl}else{$cityInfo.url}
 $cityPath=Join-Path $cityAssetRoot ($cityQuery.key+'.jpg')
 Invoke-WebRequest -Uri $cityUrl -UserAgent 'PersiaMarket/1.0' -OutFile $cityPath
 $cityManifest += [ordered]@{key=$cityQuery.key;title=$citySelected.title;src=('/assets/journal/cities/'+$cityQuery.key+'.jpg');width=($cityInfo.thumbwidth ?? $cityInfo.width);height=($cityInfo.thumbheight ?? $cityInfo.height);author=[Net.WebUtility]::HtmlDecode(($cityMeta.Artist.value -replace '<[^>]+>',''));license=$cityMeta.LicenseShortName.value;licenseUrl=($cityMeta.LicenseUrl.value ?? 'https://creativecommons.org/publicdomain/mark/1.0/');source=$cityInfo.descriptionurl;original=$cityInfo.url;downloaded=$cityUrl;description=[Net.WebUtility]::HtmlDecode(($cityMeta.ImageDescription.value -replace '<[^>]+>',''))}
 $cityManifest | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'city-photo-credits.json') -Encoding utf8
 Write-Output ($cityQuery.key+': '+$citySelected.title+' ['+$cityMeta.LicenseShortName.value+']')
}
