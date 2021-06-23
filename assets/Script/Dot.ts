// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import GameController, { GameStatus } from "./GameController";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Dot extends cc.Component 
{

    dotAngle: number;
    r: number =  0;                 // radio de giro
    originX: number =  0;           // origen del circulo. Coordenada en X
    originY: number =  0;           // origen del circulo. Coordenada en Y

    @property(cc.Sprite)
    spLockBase: cc.Sprite = null;

    // asignamos el componente del GameController
    gameController: GameController = null;

    onLoad () 
    {
        this.spLockBase = this.node.getChildByName("combination").getComponent(cc.Sprite); 
        this.gameController = cc.Canvas.instance.node.getComponent("GameController");          
    }

    start () 
    {
        // coordenadas del centro del circulo
        this.originX = this.spLockBase.node.position.x;
        this.originY = this.spLockBase.node.position.y; 

        // radio del circulo de giro
        this.r = this.spLockBase.node.width/2 - this.node.height/1.2;  
    }

    Rand(min: number, max: number): number 
    {
        // generador de numeros random
        return (Math.random() * (max - min + 1) | 0) + min;
    }          

    destroyDot()
    {
        this.node.destroy();
    }

    
}
