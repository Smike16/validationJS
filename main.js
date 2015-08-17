var validation, validationTypes, decorateInput;

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
          if (validationTypes[input]) {
            validated = validationTypes[input](currentType.node, data[input], input);
          } else {
            validated = validationTypes.default(currentType.node, data[input], input);
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

decorateInput = function(input) {
  input.classList.add('error');
};

validationTypes = {
  phone: function(input, value, key) {
    if (!value) {
      decorateInput(input);
      return false;
    }
    return true;
  },

  email: function(input, value, key) {
    var pattern = /^([a-z0-9_\.-])+@[a-z0-9-]+\.([a-z]{2,4}\.)?[a-z]{2,4}$/i;

    if (!pattern.test(value)) {
      decorateInput(input);
      return false;
    }
    return true;
  },

  name: function(input, value, key) {
    if (!value) {
      decorateInput(input);
      return false;
    }
    return true;
  },

  lastname: function(input, value, key) {
    if (!value) {
      decorateInput(input);
      return false;
    }
    return true;
  },

  default: function(input, value, key) {
    if (!value) {
      decorateInput(input);
      return false;
    }
    return true;
  }
};

validation.init({
  formSelector: '.form',
  url: 'some url here',
  inputTypes: ['phone', 'email', 'name', 'lastname', 'description']
});
