/*
import ColorLog from '~/services/ColorLog'
const log = new ColorLog(styles, option);
log.setStyles({})
log.info('ok');
 */
export default class ColorLog {
  styles = {
    debug:    'color: #ccc;     background: transparent;',
    log:      '',
    info:     'color: #036cc3;  background: #def5ff;',
    warning:  'color: #fb9209;  background: transparent;',
    error:    'color: #f00;     background: transparent;',
    highlight: 'color: white; background: #fb9209; padding: 4px;',
  };

  config = {
    prefix: '',
  };

  constructor(overrideStyles, option) {
    if (overrideStyles) {
      this.setStyle(overrideStyles);
    }
    if (option) {
      this.setConfig(option);
    }
  }

  /**
   * @param newStyles {{log: 'color:black'}}
   */
  setStyle(newStyles) {
    const keys = Object.keys(newStyles);
    for (let i = 0, c = keys.length; i < c; i++) {
      const k = keys[i];
      const v = newStyles[k];
      this.styles[k] = v;
    }
  }

  setConfig(conf) {
    this.config = Object.assign(this.config, conf);
  }
  
  console_log(level, msg, ...params) {
    console.log('%c' + this.config.prefix + msg, this.styles[level], ...params)
  }

  debug(msg, ...params) {
    this.console_log('debug', msg, ...params)
  }

  log(msg, ...params) {
    this.console_log('log', msg, ...params)
  }

  info(msg, ...params) {
    this.console_log('info', msg, ...params)
  }

  warn(msg, ...params) {
    this.console_log('warning', msg, ...params)
  }

  error(msg, ...params) {
    this.console_log('error', msg, ...params)
  }
}

