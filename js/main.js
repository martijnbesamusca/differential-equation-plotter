function init(){
    M.Tabs.init(document.getElementsByClassName('tabs')[0]);

    window.scene = new DiffGrid();
    scene.setPolar((r,t)=>r*(r-1)*(r-2), (r,t)=> 1);
    scene.start();
}

function activeMatxy() {
    const mat = [[],[]];
    for(let i = 0; i < 2; i++) {
        for(let j = 0; j < 2; j++) {
            const name = 'mat' + (i + 1) + (j + 1);
            const elm = document.getElementById(name);
            if(!elm.reportValidity()) {
                return;
            }
            const val = parseFloat(elm.value);
            if(Number.isNaN(val)) {
                logError('Value is not a number:', elm.value);
                return;
            }
            mat[i][j] = val;
        }
    }

    Logger.clearError();

    scene.setMatrix(mat)
}
function activateDrDt(){
    const dr_elm = document.getElementById('dr');
    const dt_elm = document.getElementById('dt');

    if(!dr_elm.reportValidity() || !dt_elm.reportValidity()) return;

    const dr_text = document.getElementById('dr').value;
    const dt_text = document.getElementById('dt').value;

    let dr,dt;
    try{
        dr = math.compile(dr_text);
        dt = math.compile(dt_text);
    } catch (e) {
        logError('Could not compile:', e.message);
        return;
    }

    try{
        dr.eval({r:1, θ:1, t:1});
        dt.eval({r:1, θ:1, t:1});
    } catch (e) {
        logError('Could not execute:', e.message);
        return;
    }

    Logger.clearError();

    const dr_func = (r,t) => dr.eval({r:r, θ:t, t:t});
    const dt_func = (r,t) => dt.eval({r:r, θ:t, t:t});

    scene.setPolar(dr_func, dt_func)
}

function activateDxDy(){
    const dx_elm = document.getElementById('dx');
    const dy_elm = document.getElementById('dy');

    if(!dx_elm.reportValidity() || !dy_elm.reportValidity()) return;

    const dx_text = document.getElementById('dx').value;
    const dy_text = document.getElementById('dy').value;

    let dx,dy;
    try{
        dx = math.compile(dx_text);
        dy = math.compile(dy_text);
    } catch (e) {
        logError('Could not compile:', e.message);
        return;
    }

    try{
        dx.eval({x:1,y:1});
        dy.eval({x:1,y:1});
    } catch (e) {
        logError('Could not execute:', e.message);
        return;
    }

    Logger.clearError();

    const dx_func = (x,y) => dx.eval({x:x, y:y});
    const dy_func = (x,y) => dy.eval({x:x, y:y});

    scene.setDxDy(dx_func, dy_func);
}

function resetSaved(){
    if(confirm('Do you want to reset your settings?')){
        localStorage.clear();
        location.reload();
    }
}

init();