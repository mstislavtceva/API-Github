const USER_PER_PAGE = 5;

const search = document.querySelector(".search");
const searchInput = document.querySelector(".search__input");
const autocomplete = document.querySelector(".autocomplete__list");
const repo = document.querySelector(".repo");
const repoList = document.querySelector(".repo__list");

// Функция декоратор для оптимизации поискового запроса
const debounce = function (callee, timeoutMs) {
  return function perform(...args) {
    let previousCall = this.lastCall;
    this.lastCall = Date.now();
    if (previousCall && this.lastCall - previousCall <= timeoutMs) {
      clearTimeout(this.lastCallTimer);
    }
    this.lastCallTimer = setTimeout(() => callee(...args), timeoutMs);
  };
};

// Функция добавления и удаления реопзиториев
const addCard = function (item) {
  // Создаем элемент списка и добавляем в список
  const card = `
      <li class="repo__item">
        <div class="repo__info">
          <span class="repo__name">Name: ${item.name}</span>
          <span class="repo__owner">Owner: ${item.owner.login}</span>
          <span class="repo__stars">Stars: ${item.stargazers_count}</span>
        </div>
          <button class="btn-close"></button>
      </li>
  `;
  repoList.insertAdjacentHTML("afterbegin", card);
  repo.classList.add("active");
  // Очищаем
  searchInput.value = "";
  autocomplete.innerHTML = "";

  // Удаляем элементы списка
  repoList
    .querySelector(".repo__item")
    .addEventListener("click", function (event) {
      if (event.target.className === "btn-close") {
        event.target.parentNode.remove();
      }

      // Если элементов не осталось
      if (repoList.children.length === 0) {
        // ... то возвращаем display: none
        repo.classList.remove("active");
      }
      // Очищаем
      searchInput.value = "";
      autocomplete.innerHTML = "";
    });
};

// Функция запроса и поиска данных из инпута
const searchRepo = async function (inputValue) {
  return await fetch(
    `https://api.github.com/search/repositories?q=${inputValue}&per_page=${USER_PER_PAGE}`
  ).then((response) => {
    if (response.ok) {
      response.json().then((data) => {
        // Получаем данные
        const reposArr = data.items.map((repo) => repo);

        if (reposArr === 0) {
          autocomplete.innerHTML = "<li>No results...</li>";
        } else {
          reposArr.forEach((repo) => {
            // Создаем элемент автокомплита
            const repoItem = document.createElement("li");
            repoItem.className = "autocomplete__item";
            repoItem.textContent = `${repo.name}`;

            // Навешиваем обработчик
            repoItem.addEventListener("click", () => addCard(repo));

            // Добавляем элемент в блок подсказок
            autocomplete.classList.add("active");
            autocomplete.append(repoItem);
          });
        }
      });
    } else {
      autocomplete.innerHTML = "<li>Try again...</li>";
      console.error("Something wrong!");
    }
  });
};

const debouncedfunc = debounce(searchRepo, 500);

searchInput.addEventListener("input", function (event) {
  const userData = event.target.value;
  if (!userData) {
    autocomplete.innerHTML = "";
    autocomplete.classList.remove("active");
  }

  if (event.target.value[0] === " ") {
    return;
  }

  debouncedfunc(event.target.value.trim());
});
