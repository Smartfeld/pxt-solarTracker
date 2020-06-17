// Id to identify the different ldr sensor
enum ldrId {
    TopLeft,
    TopRight,
    BottomLeft,
    BottomRight
}
enum servoId {
    Pan = 1,
    Tilt = 2
}
enum directionId {
    Up = 0,
    Down = 1,
    Left = 2,
    Right = 3
}
enum modeId {
    Manually,
    Automatic,
    Remote
}
//Hardware limit of plattform
enum servoLimit {
    panUp = 180,
    panLow = 0,
    tiltUp = 180,
    tiltLow = 0
}

//% weight=100 color=#0fbc11 icon=""
namespace Solar {
    // I2C address of solar device
    const i2cAddr = 8;
    // time to wait before read, in micros
    const wTime = 1000;

    export function writeCom(command: string): void {
        // creat comand buffer to store each char of the command string
        let comBuf = pins.createBuffer(16);
        // comand string 
        let comStr = command;

        for (let i = 0; i < comStr.length; i++) {
            comBuf.setNumber(NumberFormat.Int8LE, i, comStr.charCodeAt(i));
        }
        pins.i2cWriteBuffer(i2cAddr, comBuf, false);
    }
    export function read(): number {
        let rBuf = pins.i2cReadBuffer(i2cAddr, 4, false);
        let str = "";
        for (let i = 0; i < 4; i++) {
            str += String.fromCharCode(rBuf.getNumber(NumberFormat.Int8LE, i));
        }
        return parseInt(str);
    }
    export function read_str(): string {
        let rBuf = pins.i2cReadBuffer(i2cAddr, 4, false);
        let str = "";
        for (let i = 0; i < 4; i++) {
            str += String.fromCharCode(rBuf.getNumber(NumberFormat.Int8LE, i));
        }
        return str;
    }

    /**
     * TODO: Beschreibe deine Funktion hier
     * @param id 
     */

    //% blockId="solar_readLDR" block=" LDR %ldrId| value" 
    export function readLDR(id: ldrId): number {
        let str = ""
        // "tl" : 0,
        // "tr" : 1,
        // "bl" : 2,
        // "br" : 3
        switch (id) {
            case ldrId.TopLeft: str = "tl,?";
                break;
            case ldrId.TopRight: str = "tr,?";
                break;
            case ldrId.BottomLeft: str = "bl,?";
                break;
            case ldrId.BottomRight: str = "br,?";
                break;
        }
        writeCom(str);
        control.waitMicros(wTime)
        return read();
    }

    //% blockId="solar_readServo" block=" Servo %servoId| value" 
    export function readServo(id: servoId): number {
        let str = "";

        switch (id) {
            case servoId.Pan: 
                str = "servoP,?";
                break;
            case servoId.Tilt: str = "servoT,?";
                break;
            default:
                break;
        }
        writeCom(str);
        control.waitMicros(wTime)
        return read();
    }

    //% blockId="solar_readServo_string" block=" Servo %servoId| value as string" 
    export function readServo_str(id: servoId): string {
        let str = "";

        switch (id) {
            case servoId.Pan: str = "servoP,?";
                break;
            case servoId.Tilt: str = "servoT,?";
                break;
        }
        writeCom(str);
        control.waitMicros(wTime)
        return read_str();
    }

    //% blockId="solar_readSolarCell" block="solar cell value" 
    export function readSolarCell(): number {
        let str = "solarC,?";
        writeCom(str);
        control.waitMicros(wTime)
        return read();
    }

    //% blockId="solar_readMode" block="mode value" 
    export function readMode(): number {
        let str = "opMode,?";
        writeCom(str);
        control.waitMicros(wTime)
        return read();
    }

    //% blockId="solar_writeServo" block=" Write servo %id  %degree degrees" 
    //% degree.min=0 degree.max=180 degree.defl=90
    export function writeServo(id: servoId, degree: number): void {
        let str = "";

        switch (id) {
            case servoId.Pan: str = "servoP,";
                break;
            case servoId.Tilt: str = "servoT,";
                break;
        }
        // auto conversion from number to string
        str += degree.toString();
        writeCom(str);
    }
    //% blockId="solar_setMode" block="Set mode %id=modeEnum" 
    export function setMode(id: modeId): void {
        let str = "opMode,";

        switch (id) {
            case modeId.Manually: str += 0;
                break;
            case modeId.Automatic: str += 1;
                break;
            case modeId.Remote: str += 2;
                break;
        }
        writeCom(str);
    }
    // function to turn: up, down, left, right, direction is a parameter
    //% blockId="solar_turndir" block=" turn %dir=solar_dirEnum| %val"
    //% val.min=0 val.max=180 val.defl=180
    export function turnDir(dir: number, val: number): void {
        let turn = dir*1000 + val;
        let str = "turnDir,";
        str += turn.toString();
        writeCom(str);
    }
    // function to turn Pan or Tilt, value can be + or -
    //% blockId="solar_turnval" block="turn %servo=solar_servoEnum %val"
    //% val.min=-180 val.max=180 val.defl=0
    export function turnVal(servo: servoId, val: number): void {
        switch (servo) {
            case servoId.Pan:
                if(val > 0)
                {
                    turnDir(Solar.dirEnum(directionId.Left), val)
                }
                else
                {
                    turnDir(Solar.dirEnum(directionId.Right), val)
                }
                break;
            case servoId.Tilt:
                if(val > 0)
                {
                    turnDir(Solar.dirEnum(directionId.Down), val)
                }
                else
                {
                    turnDir(Solar.dirEnum(directionId.Up), val)
                }
                break;
        }
    }
    /*
    // function to turn: left, right, up, down direction is a parameter
    //% blockId="solar_turndir" block=" turn %dir=solar_dirEnum| %val"
    //% val.min=0 val.max=180 val.defl=180
    export function turnDir(dir: number, val: number): void {
        let angle = 0;

        switch (dir) {
            case directionId.left:
                angle = Solar.readServo(servoId.Pan) + val;
                if ((angle > servoLimit.panLow) && (angle < servoLimit.panUp)) {
                    Solar.writeServo(servoId.Pan, angle);
                }
                break;
            case directionId.right:
                angle = Solar.readServo(servoId.Pan) - val;
                if ((angle > servoLimit.panLow) && (angle < servoLimit.panUp)) {
                    Solar.writeServo(servoId.Pan, angle);
                }
                break;
            case directionId.up:
                angle = Solar.readServo(servoId.Tilt) - val;
                if ((angle > servoLimit.tiltLow) && (angle < servoLimit.tiltUp)) {
                    Solar.writeServo(servoId.Tilt, angle);
                }
                break;
            case directionId.down:
                angle = Solar.readServo(servoId.Tilt) + val;
                if ((angle > servoLimit.tiltLow) && (angle < servoLimit.tiltUp)) {
                    Solar.writeServo(servoId.Tilt, angle);
                }
                break;
        }
    }
    */
    /*
    // function to turn: Pan or tilt, value can be + or -
    //% blockId="solar_turnval" block="turn %servo=solar_servoEnum %val"
    //% val.min=-180 val.max=180 val.defl=0
    export function turnVal(servo: servoId, val: number): void {
        let angle = 0;

        switch (servo) {
            case servoId.Pan:
                angle = Solar.readServo(servoId.Pan) + val;
                if ((angle > servoLimit.panLow) && (angle < servoLimit.panUp)) {
                    Solar.writeServo(servoId.Pan, angle);
                }
                break;
            case servoId.Tilt:
                angle = Solar.readServo(servoId.Tilt) + val;
                if ((angle > servoLimit.tiltLow) && (angle < servoLimit.tiltUp)) {
                    Solar.writeServo(servoId.Tilt, angle);
                }
                break;
        }
    }
    */
    // function to provide direction enum as block
    //% blockId="solar_dirEnum" block="%dir"
    export function dirEnum(dir: directionId): directionId {
        return dir;
    }
    // function to provide servo enum as block
    //% blockId="solar_servoEnum" block="%servoId"
    export function servoEnum(servo: servoId): servoId {

        return servo;
    }
    // function to provide mode enum as block
    //% blockId="solar_modeEnum" block="%modeId"
    export function modeEnum(mode: modeId): modeId {

        return mode;
    }
}