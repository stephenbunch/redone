import React from 'react';
import ReactDOMServer from 'react-dom/server';
import StaticAsyncRenderContext from './internals/StaticAsyncRenderContext';

export default function renderAsync(element, renderFunc = ReactDOMServer.renderToStaticMarkup) {
  return new Promise((resolve, reject) => {
    let rendering = false;
    const render = () => {
      if (!rendering) {
        rendering = true;
        context.reset();
        const result = renderFunc(React.createElement(Container, null, element));
        if (context.pending === 0) {
          resolve(result);
        }
        rendering = false;
      }
    };
    const context = new StaticAsyncRenderContext({ didError: reject, didFinish: render });
    class Container extends React.Component {
      static propTypes = {
        children: React.PropTypes.node,
      };

      static childContextTypes = {
        __STATIC_RENDER: React.PropTypes.instanceOf(StaticAsyncRenderContext),
      };

      getChildContext() {
        return {
          __STATIC_RENDER: context,
        };
      }

      render() {
        return this.props.children;
      }
    }
    render();
  });
}
