const conditional = {
    init() {
        const elems = document.querySelectorAll('[data-activation]');
        elems.forEach((elm)=>{
            const condition = elm.getAttribute('data-activation')!;
            let trigger_elem_names = condition.match(/[a-z0-9._'"]+/gi);
            if(!trigger_elem_names) return;
            trigger_elem_names = trigger_elem_names.filter((s)=>s.charAt(0) != "'" && s.charAt(0) != '"');

            for(const trigger_elem_name of trigger_elem_names){
                const trigger_elm = document.getElementById(trigger_elem_name);
                if(!trigger_elm){
                    console.warn(trigger_elem_name, 'not found');
                    continue;
                }

                const condition_s = 'return '+condition.replace(new RegExp(trigger_elem_name, 'g'), `document.getElementById("${trigger_elem_name}").value`);
                const conditionFunc = new Function(condition_s);

                for(const trigger_elem_name of trigger_elem_names) {
                    const trigger_elm = document.getElementById(trigger_elem_name);
                    if (!trigger_elm) {
                        console.warn(trigger_elem_name, 'not found');
                        continue;
                    }
                    const elm_comment = document.createComment(elm.outerHTML);
                    const listener = ()=>{
                        if(conditionFunc()) {
                            if(elm_comment.parentElement) {
                                elm_comment.parentElement.replaceChild(elm, elm_comment);
                            }
                        } else {
                            if(elm.parentElement) {
                                elm.parentElement.replaceChild(elm_comment, elm);
                            }
                        }
                    };
                    trigger_elm.addEventListener('change', listener);
                    listener();
                }
            }
        })
    },
};

conditional.init();