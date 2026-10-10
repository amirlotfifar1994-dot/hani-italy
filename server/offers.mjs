// Daily campaigns use the store's Italian calendar, including daylight saving time.
export const italyDate=(now=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
export const validOfferDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&value>='2020-01-01'&&value<='2100-12-31'&&Number.isFinite(new Date(value+'T12:00:00Z').getTime())&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
export function validateOffer(value){
 if(value===null)return null;
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).sort().join(',')!=='enabled,endDate,percent,startDate'||typeof value.enabled!=='boolean'||!Number.isInteger(value.percent)||value.percent<1||value.percent>90||!validOfferDate(value.startDate)||!validOfferDate(value.endDate)||value.endDate<value.startDate)throw Object.assign(new Error('invalidOffer'),{status:400,code:'invalidOffer'});
 return {enabled:value.enabled,percent:value.percent,startDate:value.startDate,endDate:value.endDate};
}
export function offerStatus(offer,now=new Date()){
 if(!offer?.enabled)return 'disabled';
 const day=italyDate(now);
 return day<offer.startDate?'scheduled':day>offer.endDate?'expired':'active';
}
export function offerPrice(product,now=new Date()){
 if(!Number.isInteger(product.cents)||product.cents<1||product.stockPending||product.publicationHold||offerStatus(product.dailyOffer,now)!=='active')return product;
 // Daily campaigns replace ordinary discounts; they never stack with them.
 const reference=product.compareAtCents||product.cents;
 const cents=Math.max(1,Math.round(reference*(100-product.dailyOffer.percent)/100));
 return {...product,baseCents:product.cents,baseCompareAtCents:product.compareAtCents??null,cents,compareAtCents:reference,dailyOfferActive:true};
}
