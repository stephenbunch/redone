/* eslint-disable no-use-before-define */

import MultiPassRenderContext from './internals/MultiPassRenderContext';

export default function renderAsync(renderFunc, element) {
  return new Promise((resolve, reject) => {
    let rendering = false;
    const render = () => {
      if (!rendering) {
        rendering = true;
        context.reset();
        let result;
        try {
          result = context.render(() => renderFunc(element));
        } catch (err) {
          reject(err);
          return;
        }
        if (!context.pending) {
          resolve(result);
        }
        rendering = false;
      }
    };
    const context = new MultiPassRenderContext({ onError: reject, next: render });
    render();
  });
}
