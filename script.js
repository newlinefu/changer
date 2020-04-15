let contentJSON = 
`[
	{
		"name": "Three Days Grace",
		"photo":"контент/three-days-grace.1_f.jpg",
		"subs":3500,
		"description":"Three Days Grace — канадская рок-группа, исполняющая альтернативный метал и постгранж. Была сформирована под названием Groundswell в Норвуде, Онтарио, Канада в 1992 году."
	},
	{
		"name":"Thousand Foot Krutch",
		"photo":"контент/31.jpg",
		"subs":6900,
		"description":"Thousand Foot Krutch (сокращенно TFK) — канадская рок-группа. По словам фронтмена группы Тревора МакНивена, название означает тот момент в нашей жизни, когда мы понимаем, что нельзя полагаться только на свои силы."
	},
	{
		"name":"Pyrokinesis",
		"photo":"контент/m1000x1000.jpg",
		"subs":3500,
		"description":"Pyrokinesis – он же Андрей Пирокинезис. Его музыка - это не просто выдуманный образ, а реально прожитые и прочувствованные автором моменты. Он умеет создать атмосферу, которая сразу возникает при прослушивании треков."
	},
	{
		"name":"ГРОБ",
		"photo":"контент/GuVUT8XBArw_d_850.jpg",
		"subs":10000,
		"description":"«Гражданская оборона» — советская и российская рок-группа, основанная 8 ноября 1984 года в Омске Егором Летовым и Константином Рябиновым, наиболее заметная представительница сибирского панк-рока."
	},
	{
		"name":"Horus",
		"photo":"контент/unnamed.jpg",
		"subs": 1300,
		"description":"Денис Луперкаль — один из участников группы Проект Увечье. (прим. Нередко вместе с названием группы приписывают числа 16 13, которые обозначают 16 и 13 буквы латинского алфавита p и m — Project mayhem."
	}
]`;
const changeling = document.getElementById('changeling');

//Класс контента карточек
class Content{
	constructor(name, photo, subs, info) {
		this.name = name;
		this.photo = photo;
		this.subs = subs;
		this.info  = info;
	}
}

//Класс преобразования карточек в различные форматы
class ContentConvertion{
	constructor(content) {
		this.content = content;
	}
	intoJSON() {
		return JSON.stringify(this.content, null, 3);
	}
}

//Генерация пробного контента
function generateArrayOfContent() {
	const arrayOfContent = [];
	for(let item of JSON.parse(contentJSON)) {
		arrayOfContent.push(new Content(item.name, item.photo, item.subs, item.description));
	}
	return arrayOfContent;
}

let getNextContent = controlContent(generateArrayOfContent(contentJSON));
buildTheFrontBlock(getNextContent());
buildTheNextBlock(getNextContent());





function createOneBlock(content) {
	const block = document.createElement('div');
	block.className = 'change_item';
	block.innerHTML = 
	`
		<div class="block">
			<div class="wrapper">
				<div class="name">
					${content.name}
				</div>
				<img data-src = ${content.photo} alt = "">
				<div class="subs">
					Подписчиков: <span>${content.subs}</span>
				</div>
				<div class="description">
					Описание: <span>${content.info}</span>
				</div>
			</div>
		</div>
	`;
	giveShapeToChangelingFrameToBlock(block);
	lazyLoad(block.querySelector('img'));
	return block;
}

//Функция постепенной прогрузки изображений
function lazyLoad(img) {
	img.setAttribute('src', img.getAttribute('data-src'));
	img.onload = function() {
		img.removeAttribute('data-src');
	}
}

function giveShapeToChangelingFrameToBlock(block) {
	block.style.width = `${changeling.clientWidth}px`;
	block.style.height = `${changeling.clientHeight}px`;
}

//Функция для хранения характеристик массива и для его псевдоинкапуляции. Забирается контент ИЗ КОНЦА
//для увеличения скорости на стороне клиента (предполагается изначальная сортировка на стороне сервера)
function controlContent(arrayOfContent) {

	//Остаток контента (для регуляции подгрузки)
	getContent.balanceOfContent = arrayOfContent.length;
	getContent.allContent = arrayOfContent;

	function getContent(){
		getContent.balanceOfContent--;
		return arrayOfContent.pop();
	}

	return getContent;
}

//Инициализация класса впередистоящего элемента и добавление
//(используется при прогрузке следующего массива, чтобы построить первый элемент)
function buildTheFrontBlock(content) {
	if(content) {
		const buildedBlock = createOneBlock(content);
		buildedBlock.classList.add('front');
		changeling.append(buildedBlock);		
		buildedBlock.addEventListener('mousedown', eventChange);
	}
}

//Построение следующего блока. Идет постепенная подгрузка следующего контента
function buildTheNextBlock(content) {
	if(content) {
		const buildedBlock = createOneBlock(content);
		buildedBlock.classList.add('next');
		changeling.append(buildedBlock);		
	}
}

//Удаление старого начального блока, его замена с next, построение нового next
function rebuildBlocks(content) {
	if(content) {
		const deletedElement = document.querySelector('.front');
		deletedElement.removeEventListener('mousedown', eventChange);
		deletedElement.remove();
		deletedElement.classList.remove('front');

		const nextElement = document.querySelector('.next');

		//Задержка для переворота заднего элемента на передний план
		nextElement.style.transition = '0.5s';
		nextElement.classList.add('front');
		nextElement.classList.remove('next');
		nextElement.addEventListener('mousedown', eventChange);

		buildTheNextBlock(content); 
	}
}

//callback, передаваемый слушателю события пролистывания перевертыша
function eventChange(event) {

	//Считаем клик дочерних блоков за клик по внешнему блоку
	const target = event.target.closest('.front');
	const startXClick = event.clientX;

	//Для четкого управления убираем задержку, установленную для плавного возврата
	//блока в начальное положение при отпускании мыши
	target.style.transition = 'none';
	event.preventDefault();

	document.addEventListener('mousemove', scaleElement);

	document.onmouseup = resultOfChange;
	document.onmouseout = (event) => {
		if(event.target.closest('.changeling') && (!event.relatedTarget || !event.relatedTarget.closest('.changeling')))
			resultOfChange(event);
	}

	function resultOfChange(event){

		//При пересечении определнного порога перелистываем элементы
		if(Math.abs(event.clientX - startXClick) >= changeling.offsetWidth*0.4) {
			target.style.transition = '0.5s';
			target.style.transform = 'scale(0, 1)';
			setTimeout(() => changeBlocks(), 200);
		} else {
			//Плавный возврат блока в изначальное положение
			target.style.transition = '0.5s';
			target.style.transform = 'none';   				
		}

		//Чистка всех слушателей
		document.removeEventListener('mousemove', scaleElement);
		document.onmouseup = null;
		document.onmouseout = null;
	}
	
	function scaleElement(event) {
		const actualCoordX = event.clientX;

		//Рассчет коэффициента поворота элемента
		const scale = 1 - Math.abs(actualCoordX - startXClick) * 0.007 <= 0.1
		? 0.1
		: 1 - Math.abs(actualCoordX - startXClick) * 0.007;
		target.style.transform = `scale(${scale}, 1)`;
	}

	//Постепенная подгрузка элементов
	function changeBlocks(event) {
		if(getNextContent.balanceOfContent <= 3){
			getNextContent = controlContent(generateArrayOfContent().concat(getNextContent.allContent));
		}
		rebuildBlocks(getNextContent());	
	}
}
