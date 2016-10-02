/* eslint-disable no-use-before-define */

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import MultiPassRenderContext from './internals/MultiPassRenderContext';

export default function renderAsync(element, renderFunc = ReactDOMServer.renderToStaticMarkup) {
  return new Promise((resolve, reject) => {
    let rendering = false;
    const render = () => {
      if (!rendering) {
        rendering = true;
        context.reset();
        let result;
        try {
          result = renderFunc(React.createElement(Container, null, element));
        } catch (err) {
          reject(err);
          return;
        }
        if (context.pending === 0) {
          resolve(result);
        }
        rendering = false;
      }
    };
    const context = new MultiPassRenderContext({ onError: reject, next: render });
    class Container extends React.Component {
      static propTypes = {
        children: React.PropTypes.node,
      };

      static childContextTypes = {
        __MULTI_PASS_RENDER_CONTEXT: React.PropTypes.instanceOf(MultiPassRenderContext),
      };

      getChildContext() {
        return {
          __MULTI_PASS_RENDER_CONTEXT: context,
        };
      }

      render() {
        return this.props.children;
      }
    }
    render();
  });
}
