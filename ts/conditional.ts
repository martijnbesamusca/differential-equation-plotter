const conditional = {
    init() {
        const elems = document.querySelectorAll('[data-activation]');
        elems.forEach((elm)=>{
            const condition = elm.getAttribute('data-activation')!;
            // const condition_function = this.parse.expression(condition);
            const trigger_elem_names = condition.match(/[a-z0-9._]*(?:[^'"])/gi);
            console.log(trigger_elem_names);
            // this.parse.triggerElms.forEach((trigger)=>{
            //     trigger.addEventListener('change', ()=>{
            //         if(condition_function()) {
            //             elm.classList.add('hide');
            //         } else {
            //             elm.classList.remove('hide');
            //         }
            //     })
            // })
        })
    },

    parse: {
        expression(code: string) {
            console.log(code);
            return ()=>{return Math.random() < 0.5}
        }
    }
};

conditional.init();