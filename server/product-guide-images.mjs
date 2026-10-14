// Unique AI-created editorial scenes. These do not depict commercial pack contents.
const subjects = {
 ghormeh:['قرمه‌سبزی بدون گوشت با لوبیا قرمز و قارچ','Meatless Ghormeh Sabzi with kidney beans and mushrooms','Ghormeh Sabzi senza carne con fagioli rossi e funghi'],
 gheimeh:['قیمه لپه با سیب‌زمینی خلالی','Yellow split-pea Gheimeh with potato matchsticks','Gheimeh di piselli spezzati con patate a fiammifero'],
 fesenjan:['فسنجان گردو و رب انار با قارچ','Walnut and pomegranate Fesenjan with mushrooms','Fesenjan di noci e melograno con funghi'],
 eggplant:['قیمه بادمجان با لپه و سس گوجه','Aubergine Gheimeh with split peas and tomato sauce','Gheimeh di melanzane con legumi e pomodoro'],
 celery:['خورش کرفس، جعفری و نعناع','Celery, parsley and mint stew','Stufato di sedano, prezzemolo e menta'],
 spinach:['خورش اسفناج با آلو خشک','Spinach stew with dried plums','Stufato di spinaci con prugne secche'],
 rice:['برنج دانه‌بلند با زعفران و ته‌دیگ','Long-grain saffron rice and crisp tahdig','Riso lungo allo zafferano e tahdig croccante'],
 dolmeh:['دلمه برگ مو با برنج و سبزی','Vine-leaf parcels filled with rice and herbs','Involtini di foglie di vite con riso ed erbe'],
 ash:['آش رشته با حبوبات و پیازداغ','Persian herb noodle soup with beans and fried onions','Zuppa persiana di erbe e pasta con legumi e cipolle'],
 beans:['خوراک لوبیا چیتی در سس گوجه','Pinto beans in tomato sauce','Fagioli borlotti in salsa di pomodoro'],
 soya:['ماکارونی با سس سویا، قارچ و گوجه','Spaghetti with textured soya, mushrooms and tomato','Spaghetti con soia, funghi e pomodoro'],
 okra:['خورش بامیه در سس گوجه','Whole okra pods in tomato stew','Stufato di gombo intero al pomodoro'],
 'herb-stew':['قلیه سبزی و تمرهندی با قارچ','Coriander and tamarind Ghalieh with mushrooms','Ghalieh di coriandolo e tamarindo con funghi'],
 curd:['کشک بادمجان با پیازداغ و نعناع','Mashed aubergine with kashk, onions and mint','Crema di melanzane con kashk, cipolle e menta'],
 baghali:['باقلا قاتق خانگی با لوبیای سفید، شوید و تخم‌مرغ','White-bean Baghali Ghatogh with dill and egg','Baghali Ghatogh di fagioli bianchi, aneto e uovo'],
 sholezard:['شله‌زرد زعفرانی با دارچین و بادام','Saffron rice pudding with cinnamon and almonds','Budino di riso allo zafferano con cannella e mandorle'],
 'fried-eggplant':['برش‌های بادمجان برشته روی سینی','Golden aubergine slices on a baking tray','Fette dorate di melanzana su una teglia'],
 'baghali-rice':['باقالی پلو با شوید و باقلای سبز','Fluffy rice with dill and peeled broad beans','Riso soffice con aneto e fave sbucciate'],
 'ghormeh-herbs':['جعفری، گشنیز و پیازچه برای سبزی قرمه','Parsley, coriander and spring onions for Ghormeh herbs','Prezzemolo, coriandolo e cipollotti per Ghormeh'],
 mirza:['میرزا قاسمی با بادمجان دودی و گوجه','Smoky aubergine and tomato Mirza Ghasemi','Mirza Ghasemi di melanzane affumicate e pomodoro'],
 masala:['سس ماسالا با گل‌کلم و هویج','Creamy masala sauce with cauliflower and carrots','Salsa masala cremosa con cavolfiore e carote'],
 'mushroom-beans':['خوراک لوبیا چیتی و قارچ در سس گوجه','Pinto beans and browned mushrooms in tomato gravy','Fagioli e funghi rosolati in salsa di pomodoro'],
 'rice-sack':['برنج دانه‌بلند خام و پخته','Uncooked and fluffy cooked long-grain rice','Riso lungo crudo e cotto soffice'],
 saffron:['رشته‌های زعفران و زعفران دم‌کرده','Saffron threads and golden saffron infusion','Stimmi di zafferano e infusione dorata'],
 pistachios:['مغز پسته و پسته خردشده','Pistachio kernels and chopped pistachios','Pistacchi sgusciati e tritati'],
 rosewater:['نوشیدنی شفاف گلاب خوراکی با لیمو','Clear edible-rosewater drink with lemon','Bevanda limpida di acqua di rose alimentare e limone'],
 dates:['خرما با مغز پسته و گردو','Dates filled with pistachios and walnuts','Datteri ripieni di pistacchi e noci'],
 'black-tea':['چای سیاه در استکان و قوری شیشه‌ای','Amber black tea in a glass with a glass teapot','Tè nero ambrato in bicchiere con teiera di vetro']
};

export const guideImages = Object.fromEntries(Object.entries(subjects).map(([id,alt])=>[id,{
 image:'/assets/journal/guides-v1/'+id+'.webp',
 cardImage:'/assets/journal/guides-v1/'+id+'-card.webp',
 width:1280,height:853,cardWidth:640,cardHeight:427,alt
}]));
