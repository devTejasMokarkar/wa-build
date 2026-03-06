/**
 * Centralized constants for WhatsApp Flow Builder
 */

// Version and API configuration
const VERSION = process.env.WA_FLOW_VERSION || "7.3";
const DATA_API_VERSION = "3.0";

// Component limits
const COMPONENT_LIMITS = {
  EMBEDDED_LINKS_PER_SCREEN: 3,
  MAX_SCREENS_PER_FLOW: 50,
  MAX_COMPONENTS_PER_SCREEN: 20,
  MAX_FORM_FIELDS: 15
};

// Input types
const INPUT_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  PHONE: 'phone',
  NUMBER: 'number',
  PASSWORD: 'password'
};

// Component types
const COMPONENT_TYPES = {
  TEXT_INPUT: 'TextInput',
  DROPDOWN: 'Dropdown',
  CHECKBOX_GROUP: 'CheckboxGroup',
  EMBEDDED_LINK: 'EmbeddedLink',
  FOOTER: 'Footer',
  TEXT_BODY: 'TextBody',
  FORM: 'Form'
};

// Layout types
const LAYOUT_TYPES = {
  SINGLE_COLUMN: 'SingleColumnLayout'
};

// Action types
const ACTION_TYPES = {
  NAVIGATE: 'navigate',
  COMPLETE: 'complete',
  API_CALL: 'api_call'
};

// Validation rules
const VALIDATION_RULES = {
  MAX_LENGTH: 255,
  MIN_LENGTH: 1,
  MAX_SCREEN_ID_LENGTH: 50,
  MAX_COMPONENT_NAME_LENGTH: 50,
  MAX_LABEL_LENGTH: 100
};

// WhatsApp colors
const COLORS = {
  PRIMARY: '#075E54',
  SECONDARY: '#25D366',
  SUCCESS: '#128C7E',
  ERROR: '#DC2626',
  WARNING: '#F59E0B',
  BACKGROUND: '#F0F2F5',
  CHAT_BACKGROUND: '#E5DDD5',
  WHITE: '#FFFFFF'
};

// CSS classes
const CSS_CLASSES = {
  PHONE_FRAME: 'phone-frame',
  PHONE_HEADER: 'phone-header',
  CHAT_CONTAINER: 'chat-container',
  CHAT_BUBBLE: 'chat-bubble',
  FORM_GROUP: 'form-group',
  BUTTON: 'button',
  INPUT: 'text-input',
  DROPDOWN: 'dropdown'
};

// File patterns
const FILE_PATTERNS = {
  FLOW_FILE: /\.flow\.js$/,
  SCREEN_FILE: /\.screen\.js$/,
  SUPPORTED_FILES: /\.(flow|screen)\.js$/
};

// Server configuration
const SERVER_CONFIG = {
  DEFAULT_PORT: 3000,
  HOST: 'localhost',
  TIMEOUT: 30000
};

module.exports = {
  VERSION,
  DATA_API_VERSION,
  COMPONENT_LIMITS,
  INPUT_TYPES,
  COMPONENT_TYPES,
  LAYOUT_TYPES,
  ACTION_TYPES,
  VALIDATION_RULES,
  COLORS,
  CSS_CLASSES,
  FILE_PATTERNS,
  SERVER_CONFIG
};
