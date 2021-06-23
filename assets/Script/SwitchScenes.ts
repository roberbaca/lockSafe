// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component 
{
    //audio button
    sndSelect: cc.AudioSource = null;
    
    //start button
    btnStart: cc.Button = null;
    
    onLoad () 
    {
        this.sndSelect = this.node.getChildByName("SelectSnd").getComponent(cc.AudioSource);      

        cc.director.preloadScene('Game');
    
         // busca el boton Start
         this.btnStart = this.node.getChildByName("PlayButton").getComponent(cc.Button);
         this.btnStart.node.on(cc.Node.EventType.TOUCH_END,this.touchStartBtn,this);  

    }

    start () 
    {

    }

    touchStartBtn()
    {
        this.sndSelect.play();  
        cc.director.loadScene('Game');  
    }

    // update (dt) {}
}
