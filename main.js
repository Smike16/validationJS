(function() {
  var createNode,
    validation,
    validationTypes,
    decorateInput,
    undecorateInput,
    defaultValidate,
    defaults,
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
      content.map(function(contentItem) {
        node.appendChild(contentItem);
      });
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
        mapArray = Array.prototype.map.bind(selectors.node);

      mapArray(function(form, index) {
        fields[index] = {};

        config.inputTypes.map(function(input) {
          var node = form.querySelector('[name=' + input + ']');

          if (node) {
            currentInput = fields[index][input] = {};
            currentInput.node = node;
            if (currentInput.node.classList.contains('required')) {
              currentInput.required = true;
            }
          }
        });
        this.addListener(form, fields[index], config);
      }.bind(this));
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
      console.log({
        url: url,
        data: data
      });
    }
  };

  defaults = {
    errorMessages: {
      phone: 'Неверный формат телефона',
      email: 'Неверный формат почты',
      name: 'Введите имя',
      lastname: 'Введите фамилию',
      default: 'Введите значение'
    },
    regexp: {
      email: /^([a-z0-9_\.-])+@[a-z0-9-]+\.([a-z]{2,4}\.)?[a-z]{2,4}$/i
    }
  };

  showErrorTooltip = function(node, message) {
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

  showError = function(input, message) {
    decorateInput(input);
    showErrorTooltip(input, message);
  };

  decorateInput = function(input) {
    input.classList.add('error');
  };

  undecorateInput = function(input) {
    input.classList.remove('error');
    if (input.nextElementSibling) {
      input.nextElementSibling.classList.add('error-message--hidden');
    }
  };

  defaultValidate = function(input, message, condition) {
    if (!condition) {
      showError(input, message);
      return false;
    } else {
      undecorateInput(input);
      return true;
    }
  };

  validationTypes = {
    phone: function(input, value, type) {
      return defaultValidate(input, defaults.errorMessages[type], value);
    },

    email: function(input, value, type) {
      return defaultValidate(input, defaults.errorMessages[type], defaults.regexp.email.test(value));
    },

    name: function(input, value, type) {
      return defaultValidate(input, defaults.errorMessages[type], value);
    },

    lastname: function(input, value, type) {
      return defaultValidate(input, defaults.errorMessages[type], value);
    },

    default: function(input, value) {
      return defaultValidate(input, defaults.errorMessages.default, value);
    }
  };

  validation.init({
    formSelector: '.form',
    url: 'some url here',
    inputTypes: ['phone', 'email', 'name', 'lastname', 'description']
  });
}());
