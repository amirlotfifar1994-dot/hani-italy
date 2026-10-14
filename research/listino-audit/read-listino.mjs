import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const book=await SpreadsheetFile.importXlsx(await FileBlob.load('C:/Users/Amir/Downloads/Listino_Hani_Organized.xlsx'));
const summary=await book.inspect({kind:'workbook,sheet,table',maxChars:6000,tableMaxRows:5,tableMaxCols:10});
console.log(summary.ndjson);
const records=[];
for(let i=0;;i++){
 let sheet;try{sheet=book.worksheets.getItemAt(i);}catch{break;}
 if(!sheet)break;
 const range=sheet.getUsedRange();
 records.push({name:sheet.name,values:range.values,formulas:range.formulas});
}
await fs.writeFile(new URL('./source-cells.json',import.meta.url),JSON.stringify(records,null,2));
