var createNode,
  validation,
  validationTypes,
  decorateInput,
  errorMessages,
  showError;

createNode = function(tag, attributes, content) {
  var node = document.createElement(tag),
    attribute;

  for (attribute in attributes) {
    if (attributes.hasOwnProperty(attribute)) {
      node.setAttribute(attribute, attributes[attribute]);
    }
  }

  if (typeof content === 'string') {
    node.textContent = content;
  } else {
    node.appendChild(content);
  }

  return node;
};

validation = {
  state: {
    validated: null
  },

  init: function(config) {
    var generatedSelectors,
      fields;

    if (!config) {
      throw new Error('Передайте объект с параметрами');
    }

    generatedSelectors = this.generateSelectors(config);
    fields = this.findFields(generatedSelectors, config);
  },

  generateSelectors: function(config) {
    var selectors = {};

    selectors.selector = config.formSelector;
    selectors.node = document.querySelectorAll(config.formSelector);
    return selectors;
  },

  findFields: function(selectors, config) {
    var fields = {},
      form, i;

    for (i = 0; i < selectors.node.length; i += 1) {
      fields[i] = {};

      form = selectors.node[i];

      config.inputTypes.map(function(input) {
        var node = form.querySelector('[name=' + input + ']');

        if (node) {
          currentInput = fields[i][input] = {};
          currentInput.node = node;
          if (currentInput.node.classList.contains('required')) {
            currentInput.required = true;
          }
        }
      });
      this.addListener(form, fields[i], config);
    }
  },

  addListener: function(form, fields, config) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      this.state.validated = null;
      this.preValidate(fields, config);
    }.bind(this), false);
  },

  preValidate: function(fields, config) {
    var data = {},
      input,
      validated,
      currentType;

    for (input in fields) {
      if (fields.hasOwnProperty(input)) {
        currentType = fields[input];

        data[input] = currentType.node.value;

        if (currentType.required) {
          currentType.node.classList.remove('error');
          if (currentType.node.nextElementSibling) {
            currentType.node.nextElementSibling.classList.add('error-message--hidden');
          }
          if (validationTypes[input]) {
            validated = validationTypes[input](currentType.node, data[input], input, config.showErrors);
          } else {
            validated = validationTypes.default(currentType.node, data[input], config.showErrors);
          }
          if (this.state.validated !== false) {
            this.state.validated = validated;
          }
        }
      }
    }
    if (this.state.validated) {
      this.sendAjax(data, config.url);
    }
  },

  sendAjax: function(data, url) {
    console.log(data);
  }
};

errorMessages = {
  phone: 'Неверный формат телефона',
  email: 'Неверный формат почты',
  name: 'Введите имя',
  lastname: 'Введите фамилию',
  default: 'Введите значение'
};

showError = function(node, message) {
  var nextNode = node.nextElementSibling,
    messageNode;

  if (nextNode && nextNode.classList.contains('error-message')) {
    if (nextNode.textContent !== message) {
      nextNode.textContent = message;
    }
    nextNode.classList.remove('error-message--hidden');
  } else {
    messageNode = createNode('span', {
      class: 'error-message'
    }, message);
    node.parentNode.appendChild(messageNode);
  }
};


decorateInput = function(input) {
  input.classList.add('error');
};

validationTypes = {
  phone: function(input, value, type, showErrors) {
    if (!value) {
      decorateInput(input);
      if (showErrors) {
        showError(input, errorMessages[type]);
      }
      return false;
    }
    return true;
  },

  email: function(input, value, type, showErrors) {
    var pattern = /^([a-z0-9_\.-])+@[a-z0-9-]+\.([a-z]{2,4}\.)?[a-z]{2,4}$/i;

    if (!pattern.test(value)) {
      decorateInput(input);
      if (showErrors) {
        showError(input, errorMessages[type]);
      }
      return false;
    }
    return true;
  },

  name: function(input, value, type, showErrors) {
    if (!value) {
      decorateInput(input);
      if (showErrors) {
        showError(input, errorMessages[type]);
      }
      return false;
    }
    return true;
  },

  lastname: function(input, value, type, showErrors) {
    if (!value) {
      decorateInput(input);
      if (showErrors) {
        showError(input, errorMessages[type]);
      }
      return false;
    }
    return true;
  },

  default: function(input, value, showErrors) {
    if (!value) {
      decorateInput(input);
      if (showErrors) {
        showError(input, errorMessages.default);
      }
      return false;
    }
    return true;
  }
};

validation.init({
  formSelector: '.form',
  url: 'some url here',
  inputTypes: ['phone', 'email', 'name', 'lastname', 'description'],
  showErrors: true
});
