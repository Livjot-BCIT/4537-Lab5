import { EnglishMessages } from "../lang/en/en.js";

export class ClientApp {
  constructor() {
    this.messages = new EnglishMessages();

    // Replace this with Server2's hosted URL.
    this.apiBaseUrl = "https://...";

    this.pageTitle = document.getElementById("pageTitle");

    this.insertButton = document.getElementById("insertButton");

    this.queryHeading = document.getElementById("queryHeading");

    this.sqlQuery = document.getElementById("sqlQuery");

    this.queryButton = document.getElementById("queryButton");

    this.responseHeading = document.getElementById("responseHeading");

    this.responseOutput = document.getElementById("responseOutput");
  }

  start() {
    this.loadMessages();

    this.insertButton.addEventListener("click", () => {
      this.insertPatients();
    });

    this.queryButton.addEventListener("click", () => {
      this.runQuery();
    });
  }

  loadMessages() {
    document.title = this.messages.PAGE_TITLE;

    this.pageTitle.textContent = this.messages.PAGE_TITLE;

    this.insertButton.textContent = this.messages.INSERT_BUTTON;

    this.queryHeading.textContent = this.messages.QUERY_HEADING;

    this.queryButton.textContent = this.messages.QUERY_BUTTON;

    this.responseHeading.textContent = this.messages.RESPONSE_HEADING;

    this.sqlQuery.value = this.messages.DEFAULT_QUERY;
  }

  insertPatients() {
    this.responseOutput.textContent = this.messages.SENDING_MESSAGE;

    fetch(`${this.apiBaseUrl}/api/v1/insert`, {
      method: "POST",
    })
      .then((response) => {
        return response.text();
      })
      .then((data) => {
        this.responseOutput.textContent = data;
      })
      .catch((error) => {
        this.responseOutput.textContent =
          this.messages.REQUEST_ERROR + error.message;
      });
  }

  runQuery() {
    const query = this.sqlQuery.value.trim();

    if (query === "") {
      this.responseOutput.textContent = this.messages.EMPTY_QUERY_MESSAGE;

      return;
    }

    this.responseOutput.textContent = this.messages.SENDING_MESSAGE;

    const encodedQuery = encodeURIComponent(`"${query}"`);

    fetch(`${this.apiBaseUrl}/api/v1/sql/${encodedQuery}`, {
      method: "GET",
    })
      .then((response) => {
        return response.text();
      })
      .then((data) => {
        this.responseOutput.textContent = data;
      })
      .catch((error) => {
        this.responseOutput.textContent =
          this.messages.REQUEST_ERROR + error.message;
      });
  }
}
