const appState = {
  stepsNum: 4,
  formStep: 1,
  isMonthly: true,
  freeMonths: 2,
  isScreenDesktop: true,
  steps: [
    { num: 1, name: "YOUR INFO" },
    { num: 2, name: "SELECT PLAN" },
    { num: 3, name: "ADD-ONS" },
    { num: 4, name: "SUMMARY" },
  ],
  inputs: {},
  plans: [
    {
      name: "Arcade",
      img: "../images/icon-arcade.svg",
      monthlyPrice: 9,
      isSelected: true,
    },
    {
      name: "Advanced",
      img: "../images/icon-advanced.svg",
      monthlyPrice: 12,
      isSelected: false,
    },
    {
      name: "Pro",
      img: "../images/icon-pro.svg",
      monthlyPrice: 15,
      isSelected: false,
    },
  ],
  addOns: [
    {
      name: "Online sevice",
      desc: "Access to multiplayer games",
      monthlyPrice: 1,
      isSelected: true,
    },
    {
      name: "Larger storage",
      desc: "Extra 1TB of cloud save",
      monthlyPrice: 2,
      isSelected: false,
    },
    {
      name: "Costomizable profile",
      desc: "Custom theme on your profile",
      monthlyPrice: 2,
      isSelected: false,
    },
  ],
};

appState.plans.forEach(
  plan => (plan.yearlyPrice = plan.monthlyPrice * (12 - plan.freeMonths))
);

appState.addOns.forEach(
  addOn => (addOn.yearlyPrice = addOn.monthlyPrice * (12 - addOn.freeMonths))
);

// Elements seletion
const bodyEl = document.body;

// Data
const screenWidth = window.innerWidth;
const changeLayoutBreakpoint = 600;
let formStepsFuncs;

// Functions
/**
 * Renders the provided HTML string inside the specified wrapper element.
 *
 * This function first clears the content of the wrapper element and then
 * inserts the new HTML content at the beginning of the wrapper element.
 *
 * @param {string} html - The HTML string to be rendered inside the wrapper element.
 * @param {HTMLElement} wrapperEl - The DOM element where the HTML content will be rendered.
 */
const renderInUI = function (html, wrapperEl) {
  wrapperEl.textContent = "";
  wrapperEl.insertAdjacentHTML("afterbegin", html);
};

/**
 * Renders the footer HTML for a multi-step form based on the current step number.
 *
 * @param {number} stepNum - The current step number of the form.
 * @param {HTMLElement} wrapperEl - The HTML element where the footer will be appended.
 * @returns {string} The generated footer HTML string.
 */
const renderFooter = function (stepNum, wrapperEl = undefined) {
  let footerHTML;

  if (stepNum === 1)
    footerHTML = `
    <div class="form-footer">
        <button type="submit" form="form-step-${stepNum}" class="primary-btn next-btn">Next Step</button>
    </div>
    `;
  else if (stepNum === 2 || stepNum === 3)
    footerHTML = `
    <div class="form-footer">
        <button class="secondary-btn back-btn">Go Back</button>
        <button type="submit" form="form-step-${stepNum}" class="primary-btn next-btn">Next Step</button>
    </div>
    `;
  else if (stepNum === 4)
    footerHTML = `
    <div class="form-footer">
          <button class="secondary-btn back-btn">Go Back</button>
          <button type="submit" form="form-step-${stepNum}" class="primary-btn confirm-btn">Confirm</button>
        </div>
    `;

  if (wrapperEl) {
    wrapperEl.querySelector(".form-footer").remove();
    wrapperEl.insertAdjacentHTML("beforeend", footerHTML);
  }

  return footerHTML;
};

/**
 * Filters an array of items to include only those that are active.
 *
 * @param {Array} items - The array of items to filter.
 * @param {Object} items[].isSelected - A boolean indicating if the item is active.
 * @returns {Array} The filtered array containing only active items.
 */
const filterItems = function (items) {
  return items.filter(item => item.isSelected);
};

/**
 * Updates the HTML array by marking the active item with an "active" class.
 *
 * @param {Object} activeItem - The item to be marked as active.
 * @param {Array<string>} itemsHTML - The array of HTML strings.
 * @param {boolean} [isHTMLPlan=true] - Flag to determine if the item is a plan or add-on.
 */
const updateItemsHTML = function (activeItem, itemsHTML, isHTMLPlan = true) {
  const activeItemHTML = itemsHTML.find(item => item.includes(activeItem.name));
  const activeItemHTMLIndex = itemsHTML.indexOf(activeItemHTML);

  const newActiveItemHTML = activeItemHTML.replace(
    `class="${isHTMLPlan ? "plan" : "add-on"}`,
    `class="${isHTMLPlan ? "plan" : "add-on"} active`
  );

  //   console.log(newActiveItemHTML);
  //   console.log(itemsHTML);

  itemsHTML.splice(activeItemHTMLIndex, 1, newActiveItemHTML);
  //   console.log(itemsHTML);
};

/**
 * Updates the HTML of the steps to mark the current step as active.
 *
 * @param {string[]} stepsHTML - An array of HTML strings representing the steps.
 * @param {number} stepNum - The number of the current step to be marked as active.
 */
const updateStepsHTML = function (stepsHTML, stepNum) {
  // Showing step 4 active in step 5 in UI
  stepNum = stepNum === 5 ? 4 : stepNum;

  const activeStepHTML = stepsHTML[stepNum - 1];
  const activeStepHTMLIndex = stepsHTML.indexOf(activeStepHTML);

  const newActiveStepHTML = activeStepHTML.replace(
    `class="step`,
    `class="step active`
  );

  stepsHTML.splice(activeStepHTMLIndex, 1, newActiveStepHTML);
};

/**
 * Renders a single step of a multi-step form.
 *
 * @param {Object} appData - The application data.
 * @param {Object} step - The step data to be rendered.
 * @param {number} step.num - The step number.
 * @param {string} step.name - The name of the step.
 * @returns {string} The HTML string representing the rendered step.
 */
const renderStep = (appData, step) => `
<li class="step">
            <span class="step-number">${step.num}</span>
           ${
             appData.isScreenDesktop
               ? ` <span class="step-desc">
              <div class="step-number-text">STEP ${step.num}</div>
              <div class="step-name">${step.name}</div>
            </span>`
               : ""
           }
</li>
`;

/**
 * Renders the HTML for a set of steps in a multi-step form.
 *
 * @param {Object} appData - The application data, including the steps to be rendered.
 * @param {number} appData.stepsNum - The total number of steps in the form.
 * @param {Object[]} appData.steps - An array of step objects, each with a `num` and `name` property.
 * @param {number} appData.formStep - The current step number in the form.
 * @param {HTMLElement} [wrapperEl] - An optional wrapper element to insert the rendered steps into.
 * @returns {string} The HTML string representing the rendered steps.
 */
const renderSteps = function (appData, wrapperEl = undefined) {
  const stepsHTMLArr = [];
  for (let i = 0; i < appData.stepsNum; i++) {
    stepsHTMLArr.push(renderStep(appData, appData.steps[i]));
  }
  //   console.log(stepsHTMLArr);

  updateStepsHTML(stepsHTMLArr, appData.formStep);
  //   console.log(stepsHTMLArr);

  const stepsHTML = stepsHTMLArr.join("");

  if (wrapperEl) wrapperEl.insertAdjacentHTML("afterbegin", stepsHTML);

  return stepsHTML;
};

/**
 * Renders the steps wrapper HTML and optionally inserts it into a given wrapper element.
 *
 * @param {Object} appData - The application data used to render the steps.
 * @param {HTMLElement} [wrapperEl=undefined] - The optional wrapper element to insert the steps wrapper HTML into.
 * @returns {string} The generated steps wrapper HTML.
 */
const renderStepsWrapper = function (appData, wrapperEl = undefined) {
  const stepsHTML = renderSteps(appData);

  const stepsWrapperHTML = `
<div class="steps-wrapper">
         <div class="steps">
            <ul>
                ${stepsHTML}
            </ul>
         </div>
</div>`;

  if (wrapperEl) wrapperEl.insertAdjacentHTML("afterbegin", stepsWrapperHTML);

  return stepsWrapperHTML;
};

/**
 * Renders the first step of a multi-step form.
 *
 * @param {Object} appData - The application data.
 * @param {Object} appData.inputs - The input values for the form.
 * @param {string} [appData.inputs.name] - The name input value.
 * @param {string} [appData.inputs.emailAddress] - The email address input value.
 * @param {string} [appData.inputs.phoneNumber] - The phone number input value.
 * @param {number} appData.formStep - The current form step.
 * @param {HTMLElement} wrapperEl - The wrapper element where the form will be rendered.
 * @returns {string} The HTML string of the rendered form step.
 */
const renderStep1 = function (appData, wrapperEl) {
  const formGroupsHTML = `
      <div class="form-groups">
              <div class="form-group">
                <label for="name-input">Name</label>
                <input id="name-input" value="${
                  appData.inputs.name ?? ""
                }" type="text" placeholder="e.g. Stephen King">
              </div>
              <div class="form-group">
                <label for="email-input">Email Address</label>
                <input id="email-input" value="${
                  appData.inputs.emailAddress ?? ""
                }" type="email" placeholder="e.g. stephenking@lorem.com">
              </div>
              <div class="form-group">
                <label for="phone-input">Phone Number</label>
                <input id="phone-input" value="${
                  appData.inputs.phoneNumber ?? ""
                }" type="tel" placeholder="e.g. +1 234567890">
              </div>
     </div>
    `;

  const step1HTML = `
    <form action="" class="main-form active" id="form-step-1">
        <div class="form-top">
          <div class="form-header">
            <h2 class="form-title">Personal info</h2>
            <h4 class="form-subtitle">Please provide your name, email address, and phone number.</h4>
          </div>
          <div class="form-body">
            <div class="form-groups">
              ${formGroupsHTML}
            </div>
          </div>
        </div>
        ${appData.isScreenDesktop ? renderFooter(appData.formStep) : ""}
      </form>
    `;

  if (wrapperEl) renderInUI(step1HTML, wrapperEl);

  return step1HTML;
};
// console.log(renderStep1(appState, undefined));

/**
 * Renders the second step of the multi-step form.
 *
 * @param {Object} appData - The application data.
 * @param {Array} appData.plans - The list of available plans.
 * @param {boolean} appData.isMonthly - Indicates if the billing is monthly.
 * @param {boolean} appData.isScreenDesktop - Indicates if the screen is desktop size.
 * @param {HTMLElement} wrapperEl - The HTML element to render the form into.
 * @returns {string} The HTML string for the second step of the form.
 */
const renderStep2 = function (appData, wrapperEl) {
  const plansHTMLArr = appData.plans.map(
    plan => `
        <div class="plan ${appData.isMonthly ? "" : "yearly"}">
                <div class="plan-icon">
                  <img src="${plan.img.replace("..", "assets")}" alt="">
                </div>
                <div class="plan-desc">
                  <div class="plan-name">${plan.name}</div>
                  <div class="plan-price">$${
                    appData.isMonthly
                      ? `${plan.monthlyPrice}` + "/mo"
                      : `${plan.yearlyPrice}` + "/yr"
                  }</div>
                </div>
        </div>
    `
  );

  const activePlan = filterItems(appData.plans)[0];
  //   console.log(activePlan);

  // Adding .active class to active plan el HTML
  updateItemsHTML(activePlan, plansHTMLArr);

  const plansHTML = plansHTMLArr.join("");

  const step2HTML = `
<form action="" class="main-form active ${
    appData.isMonthly ? "" : "yearly"
  }" id="form-step-2">
        <div class="form-top">
          <div class="form-header">
            <h2 class="form-title">Select your plan</h2>
            <h4 class="form-subtitle">You have the option of monthly or yearly billing.</h4>
          </div>
          <div class="form-body">
            <div class="plans">
              ${plansHTML}
              </div>
               <div class="plans-time">
              <div class="plan-time ${
                appData.isMonthly ? "active" : ""
              }" id="plan-monthly">Monthly</div>
              <div class="toggle ${appData.isMonthly ? "left" : "right"}">
                <input type="checkbox" id="toggle">
                <label for="toggle"></label>
              </div>
              <div class="plan-time ${
                appData.isMonthly ? "" : "active"
              }" id="plan-yearly">Yearly</div>
            </div>
            </div>
          </div>
        </div>
        ${appData.isScreenDesktop ? renderFooter(appState.formStep) : ""}
      </form>
    `;

  if (wrapperEl) renderInUI(step2HTML, wrapperEl);

  return step2HTML;
};
// console.log(renderStep2(appState));

/**
 * Renders the third step of the multi-step form, which allows users to pick add-ons.
 *
 * @param {Object} appData - The application data.
 * @param {Array} appData.addOns - The list of available add-ons.
 * @param {boolean} appData.isMonthly - Indicates if the pricing is monthly.
 * @param {boolean} appData.isScreenDesktop - Indicates if the screen is a desktop.
 * @param {HTMLElement} wrapperEl - The HTML element where the step 3 content will be rendered.
 * @returns {string} The HTML string for the third step of the form.
 */
const renderStep3 = function (appData, wrapperEl) {
  const addOnsHTMLArr = appData.addOns.map(
    (addOn, i) => `
    <div class="add-on">
                <div class="add-on-left">
                  <div class="add-on-check">
                    <input type="checkbox" name="" id="checkbox-${i + 1}">
                    <label for="checkbox-${i + 1}"></label>
                  </div>
                  <div class="add-on-desc">
                    <div class="add-on-title">${addOn.name}</div>
                    <div class="add-on-subtitle">${addOn.desc}</div>
                  </div>
                </div>
                <div class="add-on-right">
                  <div class="add-on-price">+$${
                    appData.isMonthly
                      ? `${addOn.monthlyPrice}` + "/mo"
                      : `${addOn.yearlyPrice}` + "/yr"
                  }</div>
                </div>
    </div>
    `
  );

  const activeAddOns = filterItems(appData.addOns);

  // Adding .active class to active addOn els HTML
  activeAddOns.forEach(addOn => updateItemsHTML(addOn, addOnsHTMLArr, false));

  const addOnsHTML = addOnsHTMLArr.join("");

  const step3HTML = `
    <form action="" class="main-form active" id="form-step-3">
        <div class="form-top">
          <div class="form-header">
            <h2 class="form-title">Pick add-ons</h2>
            <h4 class="form-subtitle">Add-ons help enhance your gaming exprience.</h4>
          </div>
          <div class="form-body">
            <div class="add-ons">
             ${addOnsHTML}
            </div>
          </div>
        </div>
        ${appData.isScreenDesktop ? renderFooter(appState.formStep) : ""}
      </form>
  `;

  if (wrapperEl) renderInUI(step3HTML, wrapperEl);

  return step3HTML;
};
// console.log(renderStep3(appState));

/**
 * Renders the fourth step of the multi-step form.
 *
 * @param {Object} appData - The application data.
 * @param {Array} appData.plans - The list of available plans.
 * @param {Array} appData.addOns - The list of available add-ons.
 * @param {boolean} appData.isMonthly - Indicates if the billing is monthly or yearly.
 * @param {boolean} appData.isScreenDesktop - Indicates if the screen is desktop size.
 * @param {HTMLElement} wrapperEl - The HTML element where the form will be rendered.
 * @returns {string} The HTML string for the fourth step of the form.
 */
const renderStep4 = function (appData, wrapperEl) {
  const activePlan = filterItems(appData.plans)[0];
  const activeAddOns = filterItems(appData.addOns);

  const step4HTML = `
 <form action="" class="main-form active" id="form-step-4">
        <div class="form-top">
          <div class="form-header">
            <h2 class="form-title">Finishing up</h2>
            <h4 class="form-subtitle">Double-check everything looks OK before confirming.</h4>
          </div>
          <div class="form-body">
            <div class="checkout-details">
              <div class="checkout-plan">
                <div class="checkout-plan-left">
                  <div class="checkout-plan-title"><span class="checkout-plan-name">${
                    activePlan.name
                  }</span> (<span
                      class="checkout-plan-time">${
                        appData.isMonthly ? "Monthly" : "Yearly"
                      }</span>)</div>
                  <button class="change-plan-time-btn">Change</button>
                </div>
                <div class="checkout-plan-right">
                  <div class="checkout-plan-price">
                  $${
                    appData.isMonthly
                      ? `${activePlan.monthlyPrice}` + "/mo"
                      : `${activePlan.yearlyPrice}` + "/yr"
                  }</div>
                </div>
              </div>
              <div class="checkout-add-ons">
              ${activeAddOns.reduce((acc, addOn) => {
                return (
                  acc +
                  `
                <div class="checkout-add-on">
                  <div class="checkout-add-on-name">${addOn.name}</div>
                  <div class="checkout-add-on-price">+$${
                    appData.isMonthly
                      ? `${addOn.monthlyPrice}` + "/mo"
                      : `${addOn.yearlyPrice}` + "/yr"
                  }</div>
                </div>
                `
                );
              }, "")}
              </div>
            </div>
            <div class="checkout-total">
              <div class="checkout-total-text">Total (per <span class="total-price-plan-time">${
                appData.isMonthly ? "month" : "year"
              }</span>)</div>
              <div class="checkout-total-price">$${
                appData.isMonthly
                  ? `${
                      activePlan.monthlyPrice +
                      activeAddOns.reduce(
                        (acc, addOn) => acc + addOn.monthlyPrice,
                        0
                      )
                    }/mo`
                  : `${
                      activePlan.yearlyPrice +
                      activeAddOns.reduce(
                        (acc, addOn) => acc + addOn.yearlyPrice,
                        0
                      )
                    }/yr`
              }</div>
            </div>
          </div>
        </div>
        ${appData.isScreenDesktop ? renderFooter(appState.formStep) : ""}
      </form>
  `;

  if (wrapperEl) renderInUI(step4HTML, wrapperEl);

  return step4HTML;
};
// console.log(renderStep4(appState));

/**
 * Renders the thank you page HTML content inside the provided wrapper element.
 *
 * @param {HTMLElement} wrapperEl - The DOM element where the thank you page will be rendered.
 * @returns {string} The HTML string of the thank you page.
 */
const renderThankPage = function (_, wrapperEl) {
  const thankHTML = `
  <div class="main-form active" id="thank-page">
        <div class="thank-page-container">
          <div class="thank-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
              <g fill="none">
                <circle cx="40" cy="40" r="40" fill="#F9818E" />
                <path fill="#E96170"
                  d="M48.464 79.167c.768-.15 1.53-.321 2.288-.515a40.04 40.04 0 0 0 3.794-1.266 40.043 40.043 0 0 0 3.657-1.63 40.046 40.046 0 0 0 12.463-9.898A40.063 40.063 0 0 0 78.3 51.89c.338-1.117.627-2.249.867-3.391L55.374 24.698a21.6 21.6 0 0 0-15.332-6.365 21.629 21.629 0 0 0-15.344 6.365c-8.486 8.489-8.486 22.205 0 30.694l23.766 23.775Z" />
                <path fill="#FFF"
                  d="M40.003 18.333a21.58 21.58 0 0 1 15.31 6.351c8.471 8.471 8.471 22.158 0 30.63-8.47 8.47-22.156 8.47-30.627 0-8.47-8.472-8.47-22.159 0-30.63a21.594 21.594 0 0 1 15.317-6.35Zm9.865 15c-.316.028-.622.15-.872.344l-12.168 9.13-5.641-5.642c-1.224-1.275-3.63 1.132-2.356 2.356l6.663 6.663c.56.56 1.539.63 2.173.156l13.326-9.995c1.122-.816.43-2.993-.956-3.013a1.666 1.666 0 0 0-.17 0Z" />
              </g>
            </svg>
          </div>
          <h2 class="form-title thank-page-title">Thank you!</h2>
          <h4 class="form-subtitle thank-page-subtitle">Thanks for confirming your subscription! We hope you have fun
            using our platform. If you ever need support, please feel
            free to email us at support@loremgaming.com.</h4>
        </div>
      </div>
    `;

  if (wrapperEl) renderInUI(thankHTML, wrapperEl);

  return thankHTML;
};
// console.log(renderThankPage(undefined));

/**
 * Renders the initial HTML for the multi-step form application.
 *
 * @param {Object} appData - The application data.
 * @param {number} appData.stepsNum - The number of steps in the form.
 * @param {Array} appData.steps - An array of step data.
 * @param {boolean} appData.isScreenDesktop - Flag indicating if the screen is desktop size.
 * @param {number} appData.formStep - The current form step.
 * @param {HTMLElement} wrapperEl - The wrapper element where the HTML will be rendered.
 * @returns {string} The generated initial HTML string.
 */
const renderInitHTML = function (appData, wrapperEl) {
  const stepsWrapperHTML = renderStepsWrapper(appData);

  const initHTML = `
${appData.isScreenDesktop ? "" : stepsWrapperHTML}
<main class="main-container">
${appData.isScreenDesktop ? stepsWrapperHTML : ""}
<div class="forms-wrapper">
  ${formStepsFuncs[appData.formStep - 1](appData, undefined)}
</div>
</main>
${appData.isScreenDesktop ? "" : renderFooter(appData.formStep)}
  `;

  if (wrapperEl) renderInUI(initHTML, wrapperEl);

  return initHTML;
};
// console.log(renderInitHTML(appState, undefined));
// console.log(renderInitHTML(appState, bodyEl));

/**
 * Changes the active step in a multi-step form.
 *
 * @param {number} stepNum - The step number to activate (1-based index).
 */
const changeActiveStep = function (stepNum) {
  const stepEls = [...document.querySelectorAll(".step")];

  if (stepNum < 1 || stepNum > appState.stepsNum) return;

  stepEls.forEach(el => {
    el.classList.remove("active");
  });

  stepEls[stepNum - 1].classList.add("active");
};

/**
 * Initializes the application state and renders the initial HTML.
 *
 * This function sets the `isScreenDesktop` property of `appState` based on the
 * current screen width and a predefined breakpoint. It also initializes an
 * array of functions (`formStepsFuncs`) that correspond to the different steps
 * of the form. Finally, it calls `renderInitHTML` to render the initial HTML
 * structure.
 */
const init = function () {
  appState.isScreenDesktop =
    screenWidth > changeLayoutBreakpoint ? true : false;

  formStepsFuncs = [
    renderStep1,
    renderStep2,
    renderStep3,
    renderStep4,
    renderThankPage,
  ];

  renderInitHTML(appState, bodyEl);
};

init();

// Elements selection
const formsWrapperEl = document.querySelector(".forms-wrapper");

// Event listeners
// Change layout when screen switches to desktop/screen mode
window.addEventListener("resize", function (e) {
  const windowWidth = window.innerWidth;

  const stepsWrapperEl = document.querySelector(".steps-wrapper");
  const mainContainerEl = document.querySelector(".main-container");
  const mainFormEl = document.querySelector(".main-form");
  const footerEl = document.querySelector(".form-footer");

  if (windowWidth <= 600 && appState.isScreenDesktop) {
    appState.isScreenDesktop = false;

    stepsWrapperEl.remove();
    renderStepsWrapper(appState, bodyEl);

    if (appState.formStep < 4) {
      mainContainerEl.after(footerEl);
    }
  }

  if (windowWidth > 600 && !appState.isScreenDesktop) {
    appState.isScreenDesktop = true;

    stepsWrapperEl.remove();
    renderStepsWrapper(appState, mainContainerEl);

    if (appState.formStep < 4) mainFormEl.append(footerEl);
  }
});

// Submit form when user clicks on next btn or presses Enter key
formsWrapperEl.addEventListener("submit", function (e) {
  e.preventDefault();
  const submittedEl = e.target;

  // Matching strategy
  if (!submittedEl.closest(".main-form")) return;
  //   console.log("matching strategy worked");

  if (appState.formStep === 1) {
    // Form validation
    const step1Inputs = [
      ...document.querySelectorAll("#form-step-1 .form-group input"),
    ];
    // console.log(step1Inputs);

    // Reset form validation
    step1Inputs.forEach(input =>
      input.parentElement.classList.remove("form-group-error")
    );

    const emptyInputs = step1Inputs.filter(input => input.value.trim() === "");
    // console.log(emptyInputs);

    if (emptyInputs.length > 0) {
      emptyInputs.forEach(input =>
        input.parentElement.classList.add("form-group-error")
      );
      // Stop form submission
      return;
    } else {
      const step1InputsValues = step1Inputs.map(input => input.value);

      // Update appState
      const [name, emailAddress, phoneNumber] = step1InputsValues;
      appState.inputs = { name, emailAddress, phoneNumber };
      //   console.log(appState.inputs);
    }
  }

  // Move to the next step
  appState.formStep++;
  formStepsFuncs[appState.formStep - 1](appState, formsWrapperEl);

  changeActiveStep(appState.formStep);

  if (!appState.isScreenDesktop) renderFooter(appState.formStep, bodyEl);
});
