import React from 'react';
import ReactDOM from 'react-dom';

class Util {

    static unpack_props(props) {
        for (const key in props) {
            try {
                console.log(key, JSON.parse(props[key]))
                props[key] = JSON.parse(props[key]);
            } catch(e) {
                console.log(e)
            }
        }
    }

    static try_render(id, comp) {
        if (document.getElementById(id)) {
            let ele = document.getElementById(id);

            const final = {};

            for (const key in ele.dataset) {
                try {
                    final[key] = JSON.parse(ele.dataset[key]);
                } catch(e) {
                    if (typeof ele.dataset[key] === 'string') {
                        final[key] = ele.dataset[key];
                    } else {
                        console.log(e);
                    }
                }
            }

            return ReactDOM.render(
                React.createElement(comp, final),
                document.getElementById(id)
            );
        }
    }

}

export default Util;
