// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html


import GameController, { GameStatus } from "./GameController";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Paddle  extends cc.Component 
{
    moveLeft:number = 0;
    moveRight:number = 0;

    r: number =  0;                 // radio de giro
    angle: number =  0;             // angulo de giro
    originX: number =  0;           // origen del circulo. Coordenada en X
    originY: number =  0;           // origen del circulo. Coordenada en Y
    direction: number = 1;          // direccion de giro (horario = -1 , antihorario = 1)
    didTap: boolean = false;        // bandera para detectar si presionamos una tecla
    isHit: boolean = false;         // bandera para detectar colisiones
    missTarget: boolean = false;    // bandera para detectar si fallamos 
    onTarget: boolean = false;
    //lockPicked: number;

    resetX: number;
    resetY: number;  
    
    // asignamos el componente del GameController
    gameController: GameController = null;  
    
    // velocidad de rotacion en radianes por segundo
    rotationSpeed: number;      

    @property(cc.Sprite)
    spLockBase: cc.Sprite = null;

    @property(cc.AudioSource)
    sndHit: cc.AudioSource = null;

    // eventos del teclado. Con la tecla space intentamos acertar al circulo (dot)
    onTouch(event)
    {
        switch(event.keyCode)
        {
            case cc.macro.KEY.space:                   
                this.didTap = true;
            break;               
        }
    }
       
    stopTouch(event)
    {
        switch(event.keyCode)
        {
            case cc.macro.KEY.space:
                this.didTap = false;
            break;                
        }
    }
    

    onLoad () 
    {
        this.gameController = cc.Canvas.instance.node.getComponent("GameController");  

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN,this.onTouch,this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP,this.stopTouch,this);

        this.spLockBase = this.node.getChildByName("Lock-Base").getComponent(cc.Sprite);       
    }  
    
  
    start () 
    {
        // radio del circulo de giro
        this.r = this.spLockBase.node.width/2 - this.node.height/1.8;
        
        // coordenadas del centro del circulo
        this.originX = this.spLockBase.node.position.x;
        this.originY = this.spLockBase.node.position.y; 
        
        // posicion inicial de la paleta
        this.resetX = this.node.position.x;
        this.resetY = this.node.position.y;   
        
        this.angle = Math.PI/2;

        this.direction = Math.random() < 0.5 ? 1 : -1;
    }

    update (dt) 
    {     
        // si la partida no empezó, evito el movimiento de la nave
        if (this.gameController.gameStatus != GameStatus.Game_Playing)
        {
            return;
        }

        else
        {

        }

        if(this.didTap)
        {
            if (!this.isHit)
            {        
                this.onDotMissed(); // Si apretamos la tecla Space y NO acertamos al circulo..
            }
            else if (this.isHit)
            {                
                this.onDotScored(); // Si apretamos la tecla Space y SI acertamos al circulo..
            }
        }

        else if(!this.didTap)
        {
            if (this.isHit)
            {
                this.schedule(this.onDotMissed,0.2,0); // NO apretamos la tecla Space y hemos colisionado con el circulo..
            }
        }
        

        // movimiento de la paleta
        if (!this.missTarget)
        {
            this.rotationSpeed = this.gameController.speed;

            // giro
            this.angle += this.rotationSpeed * dt * this.direction;   

            // posicion
            this.node.setPosition(this.originX + this.r * Math.cos(this.angle) , this.originY + this.r * Math.sin(this.angle));
        }

        // un poco de trigonometria para calcular la rotacion del sprite de la paleta...
        this.node.setRotation(this.angle * 180 / Math.PI);       
        var anguloRotacion = Math.atan2(this.node.position.y - this.originY, this.node.position.x);
        anguloRotacion = anguloRotacion * 180 / Math.PI;    
       
        if(anguloRotacion < 0)
        {
            anguloRotacion = 360 - anguloRotacion;
            this.node.rotation =  90 + anguloRotacion;
        }
        else
        {
            this.node.rotation =  90 - anguloRotacion;
        }        
    }

    onCollisionEnter(otherCollider,selfCollider)
    {       
        // eventos de colision        
        this.isHit = true;               
         
        // Collision End
        this.schedule(this.onCollisionEnd,0.1,0);  

        otherCollider.node.destroy(); // destruimos el circulo
    }   
  

    onCollisionEnd()
    {                  
        this.isHit = false;           
    }
  

    onDotMissed()
    {    
        if (!this.onTarget)
        {
            // se detiene
            this.direction = 0;
            
            // shake screen effect
            this.gameController.shakeScreen();
            this.missTarget = true;
            
            // reseteamos la posicion de la paleta
            this.schedule(this.resetPaddle, 0.8,0); 
        }
    }

    onDotScored()
    {
        if (!this.onTarget)
        {
            this.sndHit.play();
            this.gameController.score++;
            this.gameController.spGreenBackground.node.active = true;  
            this.missTarget = false;          
            this.onTarget = true;  
            this.direction *= -1;
            this.schedule(this.moveDot, 0.8, 0);               
        }
    }

    moveDot()
    {
        this.gameController.spGreenBackground.node.active = false;         
        this.onTarget = false;
        this.gameController.spawnDot();            
    }

    resetPaddle()
    {
        if (this.missTarget)
        {
            // reseteamos a la posicion incial
            this.angle = Math.PI/2;
            this.node.setPosition(this.originX + this.r * Math.cos(this.angle) , this.originY + this.r * Math.sin(this.angle));

            // mostramos el fondo verde
            this.gameController.spGreenBackground.node.active = false;
            this.gameController.spRedBackground.node.active = false;               

            // elegimos una nueva direccion en forma aleatoria
            this.direction = Math.random() < 0.5 ? 1 : -1;

            this.gameController.spawnDot();     

            // descontamos una vida
            this.gameController.lives--;

            // reseteamos las banderas  
            this.didTap = false;
            this.missTarget = false;             
        }           
    }

    chooseDirection()
    {    
        var chosenValue = this.direction * -1;      
        return chosenValue;
    }      
}
