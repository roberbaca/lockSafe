// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Shake from "./ScreenShake";

const {ccclass, property} = cc._decorator;

export enum GameStatus
{
    // Estados del juego
    Game_Ready = 0,     // ready state
    Game_Playing,       // game playing
    Game_Over           // game Over
}

@ccclass
export default class GameController extends cc.Component 
{
    mainCamera: cc.Camera = null;        
    
    labelTutorial: cc.RichText = null; 
        
    spRedBackground: cc.Sprite = null;
    spGreenBackground: cc.Sprite = null; 
    spCircle: cc.Sprite = null; 
    spBusted: cc.Sprite = null; 
    spPaddle: cc.Sprite = null; 

    // HUD
    spLivesHUD1: cc.Sprite = null; 
    spLivesHUD2: cc.Sprite = null; 
    spLivesHUD3: cc.Sprite = null; 
    redCross1: cc.Sprite = null; 
    redCross2: cc.Sprite = null; 
    redCross3: cc.Sprite = null;
    labelScore: cc.RichText = null;
    labelHighScore: cc.RichText = null;

    //Game State
    gameStatus: GameStatus = GameStatus.Game_Ready;  

    // variables    
    lives: number = 3;        
    score: number = 0;   
    highScore: number = 0;  
    speed: number = 2;      

    //start button
    btnStart: cc.Button = null;

    // Game Over screen    
    isGameOver: boolean = false;   

    // prefab
    @property(cc.Prefab)
    DotPrefab:cc.Prefab  = null;

    // audioSource
    sndAlarm: cc.AudioSource = null;
    sndError: cc.AudioSource = null;
    sndSelect: cc.AudioSource = null;

    onLoad () 
    {
        // activamos el sistema de Colisiones
        var collisionManager = cc.director.getCollisionManager();
        collisionManager.enabled = true;        

        // AudioSource
        this.sndAlarm = this.node.getChildByName("AlarmSound").getComponent(cc.AudioSource);    
        this.sndError = this.node.getChildByName("ErrorSound").getComponent(cc.AudioSource);   
        this.sndSelect = this.node.getChildByName("SelectSound").getComponent(cc.AudioSource);               

        this.labelTutorial = this.node.getChildByName("TutorialLabel").getComponent(cc.RichText);
        this.labelTutorial.node.active = true;  

        this.spRedBackground = this.node.getChildByName("RedBackground").getComponent(cc.Sprite);
        this.spRedBackground.node.active = false;   

        this.spGreenBackground = this.node.getChildByName("GreenBackground").getComponent(cc.Sprite);
        this.spGreenBackground.node.active = false;  

        this.spPaddle = this.node.getChildByName("Paddle").getComponent(cc.Sprite);
        this.spPaddle.node.active = true; 

        this.spBusted = this.node.getChildByName("busted").getComponent(cc.Sprite);
        this.spBusted.node.active = false;  

        this.spCircle = this.node.getChildByName("HUD_circle").getComponent(cc.Sprite);
        this.spCircle.node.active = false; 

        this.spLivesHUD1 = this.node.getChildByName("HUD_live01").getComponent(cc.Sprite);
        this.spLivesHUD1.node.active = false;   

        this.spLivesHUD2 = this.node.getChildByName("HUD_live02").getComponent(cc.Sprite);
        this.spLivesHUD2.node.active = false;   

        this.spLivesHUD3 = this.node.getChildByName("HUD_live03").getComponent(cc.Sprite);
        this.spLivesHUD3.node.active = false;      
        
        this.redCross1 = this.node.getChildByName("redCross1").getComponent(cc.Sprite);
        this.redCross1.node.active = false;   

        this.redCross2 = this.node.getChildByName("redCross2").getComponent(cc.Sprite);
        this.redCross2.node.active = false;   

        this.redCross3 = this.node.getChildByName("redCross3").getComponent(cc.Sprite);
        this.redCross3.node.active = false;     
        
        this.mainCamera = this.node.getChildByName("Main Camera").getComponent(cc.Camera);

        this.labelScore = this.node.getChildByName("ScoreLabel").getComponent(cc.RichText);
        this.labelScore.node.active = false;         

        this.labelHighScore = this.node.getChildByName("HighScoreLabel").getComponent(cc.RichText);
        this.labelHighScore.node.active = false; 

        // busca el boton Start
        this.btnStart = this.node.getChildByName("BtnStart").getComponent(cc.Button);
        this.btnStart.node.on(cc.Node.EventType.TOUCH_END,this.touchStartBtn,this);          
        
    }

    start () 
    {       
        this.score = 0; 
        this.highScore = 0;       
    }

    update (dt)
    {
         // si la partida no empieza, salir
         if (this.gameStatus != GameStatus.Game_Playing)
         {
             return;
         }         
               
        this.labelScore.string =  this.score.toString();
        this.labelHighScore.string = "HighScore " + this.highScore.toString();

        // muestro en forma visual las vidas restantes
        if (this.lives == 2)
        {
            this.spLivesHUD1.node.active = false;
            this.spLivesHUD2.node.active = false;
            this.spLivesHUD3.node.active = true;
        }

        if (this.lives == 1)
        {
            this.spLivesHUD1.node.active = false;
            this.spLivesHUD2.node.active = true;
            this.spLivesHUD3.node.active = true;
        }

        if (this.lives == 0)
        {
            this.spLivesHUD1.node.active = true;
            this.spLivesHUD2.node.active = true;
            this.spLivesHUD3.node.active = true;
        }

        // condicion de derrota
        if (this.lives == 0)
        {
            this.gameStatus = GameStatus.Game_Over;
            this.schedule(this.GameOverScreen, 1, 0);            
        }

        // Aumentamos la dificultad
        if (this.score <= 5)
        {
            this.speed = 2;
        }
        if (this.score > 5 && this.score < 10)
        {
            this.speed = 2.8;            
        }

        if (this.score >= 10 && this.score < 20)
        {
            this.speed = 3.2;            
        }
        
        if (this.score >= 20)
        {
            this.speed = 3.8;           
        } 
    }

    shakeScreen()
    {
        this.sndError.play();

        this.spRedBackground.node.active = true;    
        this.spGreenBackground.node.active = false;        
        
        // ScreenShake (duracion, amplitud en x, amplitud en y)
        let shake:Shake = Shake.create(0.15,5,5);      
        this.mainCamera.node.runAction(shake);
    }

    spawnDot()
    {        
        var angleDot = this.Rand(0, 2 * Math.PI);
        var newDot = cc.instantiate(this.DotPrefab); 
        newDot.setPosition(220 * Math.cos(angleDot) , 220 * Math.sin(angleDot));                    
        this.node.getChildByName("dots").addChild(newDot);  
    }

    destroyDot()
    {
        var destruir = this.node.getChildByName("dots");
        destruir.removeAllChildren();
    }  

    Rand(min: number, max: number): number 
    {
        // generador de numeros random
        return (Math.random() * (max - min + 1) | 0) + min;
    }          

    touchStartBtn()
    {
        this.sndAlarm.stop();
        this.sndSelect.play();

        // condiciones iniciales        
        this.score = 0;
        this.lives = 3;

        // mostramos los elementos del HUD     
     
        this.labelScore.node.active = true; 
        this.labelHighScore.node.active = false;   
        this.spCircle.node.active = true; 
        this.labelTutorial.node.active = false;  

        this.spLivesHUD1.node.active = false;
        this.spLivesHUD2.node.active = false;
        this.spLivesHUD3.node.active = false;

        this.redCross1.node.active = true; 
        this.redCross2.node.active = true;
        this.redCross3.node.active = true; 

        this.spBusted.node.active = false;   
        
        this.spPaddle.node.active = true; 
      
        //ocultamos el boton
        this.btnStart.node.active = false;  

        // seteamos el state a Playing
        this.gameStatus = GameStatus.Game_Playing;
        this.isGameOver = false;

        this.spawnDot();                      
    }
   
    GameOverScreen()
    {       
        this.sndAlarm.play();

        //cc.director.loadScene("GameOver");
        this.spBusted.node.active = true; 
        this.labelHighScore.node.active = true;  
        this.btnStart.node.active = true;        
        this.spPaddle.node.active = false;         

        if (this.score > this.highScore)
        {
            this.highScore = this.score;
        }

        this.labelHighScore.string = "HighScore " + this.highScore.toString();
        
        this.destroyDot();
    }
}
