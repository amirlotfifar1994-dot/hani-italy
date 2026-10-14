import first from '../research/journal-inline-images-2026-10-08.json' with {type:'json'};
import rest from '../research/journal-inline-extra-images-2026-10-08.json' with {type:'json'};
const captions={
 ghormeh:['سبزی، لوبیا و لیموعمانی؛ آماده‌سازی جداگانه اجزای خورش','Herbs, beans and dried limes: preparing components separately','Erbe, fagioli e lime secchi: componenti preparati separatamente'],
 gheimeh:['لپه، رب و سیب‌زمینی؛ سه بخش قیمه','Split peas, tomato paste and potatoes: three Gheimeh components','Legumi, concentrato e patate: tre componenti del Gheimeh'],
 fesenjan:['گردوی آسیاب‌شده و رب انار؛ پایه مزه فسنجان','Ground walnuts and pomegranate molasses: the Fesenjan base','Noci macinate e melassa di melograno: la base del Fesenjan'],
 dolmeh:['مقدار مواد میانی و مراحل بستن برگ مو','Portioning the filling and folding vine leaves','Dosare il ripieno e chiudere le foglie di vite'],
 eggplant:['بادمجان تنوری و لپه پیش از ترکیب با سس','Roasted aubergines and split peas before combining','Melanzane al forno e legumi prima di unirli alla salsa'],
 celery:['برش کرفس، جعفری و مقدار کم نعناع','Cut celery, parsley and a small amount of mint','Sedano tagliato, prezzemolo e poca menta'],
 spinach:['اسفناج تازه و آبگیری‌شده در کنار آلو خشک','Fresh and drained spinach alongside dried plums','Spinaci freschi e scolati accanto alle prugne secche'],
 rice:['کنترل دانه برنج پیش از دم و آماده‌کردن زعفران','Checking rice grains before steaming and preparing saffron','Controllare i chicchi prima del vapore e preparare lo zafferano'],
 ash:['حبوبات پخته، سبزی و رشته برای پایه آش','Cooked legumes, herbs and noodles for the soup base','Legumi cotti, erbe e pasta per la base della zuppa'],
 beans:['لوبیای آبکش‌شده و پایه گوجه جداگانه','Drained beans and a separate tomato base','Fagioli sgocciolati e base di pomodoro separata'],
 soya:['مقایسه سویای خشک و بازآبگیری‌شده','Comparing dry and hydrated textured soy','Confronto tra soia testurizzata secca e reidratata'],
 okra:['بامیه سالم با ساقه کوتاه‌شده، بدون بریدن بدنه','Intact okra pods with trimmed stems','Okra integra con il gambo accorciato'],
 'herb-stew':['گشنیز، تمبرهندی و قارچ برای نسخه بدون ماهی','Coriander, tamarind and mushrooms for a fish-free version','Coriandolo, tamarindo e funghi per la versione senza pesce'],
 curd:['بادمجان نرم، کشک و پیازداغ پیش از ترکیب','Tender aubergine, kashk and cooked onions before combining','Melanzana tenera, kashk e cipolle cotte prima di unire'],
 baghali:['لوبیای سفید، شوید و تخم‌مرغ اختیاری','White beans, dill and optional eggs','Fagioli bianchi, aneto e uova facoltative'],
 sholezard:['برنج نرم‌شده و زعفران برای پایه شله‌زرد','Softened rice and saffron for Sholezard','Riso ammorbidito e zafferano per lo Sholezard'],
 'fried-eggplant':['مقایسه پخت بادمجان در تابه و سینی فر','Comparing aubergines cooked in a pan and oven tray','Confronto delle melanzane in padella e al forno'],
 'baghali-rice':['برنج آبکش، باقلای پوست‌گرفته و شوید','Drained rice, peeled broad beans and dill','Riso scolato, fave pelate e aneto'],
 'ghormeh-herbs':['سبزی‌های جداگانه پیش از خردکردن و تفت','Separate herbs before chopping and cooking','Erbe separate prima di tritare e cuocere'],
 mirza:['بادمجان تنوری، گوجه، سیر و تخم‌مرغ اختیاری','Oven-roasted aubergines, tomatoes, garlic and optional eggs','Melanzane al forno, pomodori, aglio e uova facoltative'],
 masala:['گوجه، زنجبیل، سیر و ادویه برای سس خانگی','Tomato, ginger, garlic and spices for a home sauce','Pomodoro, zenzero, aglio e spezie per una salsa domestica'],
 'mushroom-beans':['تفت قارچ جدا از لوبیای پخته','Browning mushrooms separately from cooked beans','Rosolare i funghi separatamente dai fagioli cotti'],
 'rice-sack':['یک پخت کوچک برای شناخت رفتار برنج جدید','A small cooking trial for a new rice variety','Una piccola prova di cottura per un nuovo riso'],
 saffron:['رشته، زعفران خردشده و دم‌کرده در مقدار کم','Threads, crushed saffron and a small infusion','Stimmi, zafferano pestato e un piccolo infuso'],
 pistachios:['مغز پسته خردشده و پسته با پوست برای کاربردهای متفاوت','Chopped kernels and shell-on pistachios for different uses','Pistacchi tritati e con guscio per usi diversi'],
 rosewater:['آزمون مقدار کم گلاب در نوشیدنی','Trialling a small quantity of rose water in a drink','Provare poca acqua di rose in una bevanda'],
 dates:['هسته‌گیری و پرکردن خرما با مغز ساده','Removing date pits and filling with plain nuts','Denocciolare e farcire i datteri con frutta secca'],
 'black-tea':['برگ خشک، قوری و دو شدت دم‌کرده چای','Dry leaves, a teapot and two infusion strengths','Foglie secche, teiera e due intensità di infusione'],
 'hani-editorial':['پیشنهاد چیدمان یک وعده با خورش، برنج و سبزی','A meal arrangement with stew, rice and herbs','Una tavola con stufato, riso ed erbe'],
 'culture-editorial':['یک سفره مشترک با طعم‌های ایرانی و ایتالیایی','A shared table with Iranian and Italian flavours','Una tavola condivisa con sapori iraniani e italiani'],
 'places-editorial':['دفتر مشاهده برای مقایسه نور، مصالح و فضای شهری','An observation notebook for light, materials and urban space','Un taccuino per osservare luce, materiali e spazi urbani'],
 'hani-brand':['سفره‌ای از غذاهای ایرانی؛ خورش، برنج، دلمه و دیپ بادمجان','A Persian food table: stews, rice, vine leaves and aubergine dip','Una tavola persiana: stufati, riso, foglie ripiene e crema di melanzane']
};
export const inlineAssets=Object.fromEntries([...first,...rest].map(r=>[r.id,r]));
export function inlinePhoto(id,lang){
 const image=inlineAssets[id]?.output;if(!image)throw new Error('Missing optimised inline image: '+id);
 const caption=captions[id][{fa:0,en:1,it:2}[lang]];
 return {...image,kind:'editorial',alt:({fa:'تصویرسازی: ',en:'Illustration: ',it:'Illustrazione: '})[lang]+caption,caption,credit:{fa:'',en:'',it:''}};
}
