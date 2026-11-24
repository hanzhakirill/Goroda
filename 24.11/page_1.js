// задаем ключ для локалсторэдж
const STORAGE_KEY = 'cities_game_state';
const getInitialState = () => ({ cities: [], currentPlayer: 1, attempts: 5, isGameOver: false });

// загружаем сохраненную игру из памяти браузера/создаем новую
let state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || getInitialState();

// подгружаем интерфейс из html
const hodigrok = document.getElementById('player-turn');
const popitki = document.getElementById('attempts-left');
const message = document.getElementById('message');
const input = document.getElementById('city-input');
const knopkasubmit = document.getElementById('submit-btn');
const knopkareset = document.getElementById('reset-btn');
const listgoroda = document.getElementById('cities-list');

// определяем нужную букву скипая неиграбельные
const getbukva = (city) => city.toLowerCase().trim().replace(/[ьъый]+$/, '').slice(-1);

// сохраняем прогресс и обновляем все элементы на экране
function renderim() {
    // записываем состояние в память если игра еще не закончена
    if (!state.isGameOver) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    // обновляем счетчики хода попыток и блокируем ввод при конце игры
    hodigrok.textContent = `Ход: Игрок ${state.currentPlayer}`;
    popitki.textContent = `Попыток: ${state.attempts}`;
    input.disabled = knopkasubmit.disabled = state.isGameOver;

    // выводим на экран список всех названных городов
    listgoroda.innerHTML = state.cities
        .map((item, index) => `<div class="city-item">${index + 1}. <b>${item.city}</b> (Игрок ${item.player})</div>`)
        .join('');

    // меняем подсказку в поле ввода в зависимости от последнего города
    const Gorodlast = state.cities.at(-1)?.city;
    input.placeholder = Gorodlast
        ? `Вам на букву "${getbukva(Gorodlast).toUpperCase()}"...`
        : 'Введите любой первый город...';
}

// полностью сбрасываем игру и очищаем память браузера
function clearGame() {
    localStorage.removeItem(STORAGE_KEY);
    state = getInitialState();
    message.textContent = '';
    renderim();
}

// обрабатываем ошибку игрока и отнимаем одну попытку
function failAttempt(reason) {
    state.attempts -= 1;
    input.value = '';
    message.style.color = '#d9534f';

    // завершаем игру при обнулении попыток или выводим остаток
    if (state.attempts <= 0) {
        const winner = state.currentPlayer === 1 ? 2 : 1;
        message.textContent = `Игра окончена! Игрок ${state.currentPlayer} потратил все попытки. Победил Игрок ${winner}!`;
        state.isGameOver = true;
        renderim();
        localStorage.removeItem(STORAGE_KEY);
    } else {
        message.textContent = `${reason} Осталось попыток: ${state.attempts}`;
        renderim();
    }
}

// проверяем введенный город и совершаем ход
function handleMove() {
    // прерываем выполнение если игра закончена или поле пустое
    if (state.isGameOver) return;

    const siroyinput = input.value.trim();
    if (!siroyinput) return;

    const lowerInput = siroyinput.toLowerCase();
    input.value = '';

    // проверяем не называли ли этот город ранее
    if (state.cities.some(item => item.city.toLowerCase() === lowerInput)) {
        return failAttempt('Этот город уже называли!');
    }

    // сверяем первую букву нового города с целевой буквой предыдущего
    const Gorodlast = state.cities.at(-1)?.city;
    if (Gorodlast && lowerInput.charAt(0) !== getbukva(Gorodlast)) {
        return failAttempt(`Нужен город на букву "${getbukva(Gorodlast).toUpperCase()}"!`);
    }

    // добавляем город в историю передаем ход сопернику и обновляем интерфейс
    state.cities.push({
        city: siroyinput.charAt(0).toUpperCase() + siroyinput.slice(1).toLowerCase(),
        player: state.currentPlayer
    });

    state.currentPlayer = state.currentPlayer === 1 ? 2 : 1;
    state.attempts = 5;
    message.textContent = '';
    renderim();
}

// привязываем функции к кликам по кнопкам и нажатию клавиши энтер
knopkasubmit.addEventListener('click', handleMove);
input.addEventListener('keydown', (e) => e.key === 'Enter' && handleMove());
knopkareset.addEventListener('click', clearGame);

// рендерим
renderim();


// В объекте state хранится история названных городов, текущий игрок, счетчик попыток 
// и статус партии. После каждого действия состояние записывается в localStorage 
// браузера, чтобы прогресс не сбрасывался при перезагрузке страницы.
// При вводе города функция handleMove проверяет, не было ли повтора и совпадает ли первая 
// буква с последней буквой предыдущего слова (при этом getTargetLetter автоматически отбрасывает 
// с конца ь, ъ, ы и й). Если город подходит — он добавляется в список, 
// а ход переходит сопернику. При ошибке срабатывает failAttempt, отнимая одну попытку: 
// когда они заканчиваются, игра останавливается и объявляется победитель.
// За обновление интерфейса отвечает saveAndRender — она перерисовывает список городов, меняет 
// подсказку с нужной буквой в поле ввода и блокирует кнопки после финала. Кнопка сброса (clearGame) полностью очищает
//  сохранение и начинает партию заново.