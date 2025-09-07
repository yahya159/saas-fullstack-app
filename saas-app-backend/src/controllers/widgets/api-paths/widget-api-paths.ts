export enum PUBLIC_WIDGET_API_PATHS {
  ROOT_PATH = 'public/widgets/',
  GET_WIDGET_PATH = ':widgetId',
  GET_EMBED_PATH = ':widgetId/embed',
  GET_CONFIG_PATH = ':widgetId/config',
  GET_EMBED_CODE_PATH = ':widgetId/embed-code',
}

export enum WIDGET_API_PATHS {
  ROOT_PATH = 'widgets/',
  CREATE_PATH = 'create',
  GET_ALL_PATH = '',
  GET_BY_ID_PATH = ':widgetId',
  UPDATE_PATH = ':widgetId',
  DELETE_PATH = ':widgetId',
  TOGGLE_PUBLIC_PATH = ':widgetId/toggle-public',
  TOGGLE_ACTIVE_PATH = ':widgetId/toggle-active',
  SEARCH_PATH = 'search',
  BY_APPLICATION_PATH = 'application/:applicationId',
}
