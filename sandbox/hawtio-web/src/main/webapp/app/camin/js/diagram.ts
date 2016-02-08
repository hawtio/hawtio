module Camin {

    export class Diagram {
        actors: Actor[] = [ ];
        signals: Signal[] = [ ];

        actor(name): Actor {
            for (var i = 0; i < this.actors.length; i++) {
                if (this.actors[i].name === name) {
                    return this.actors[i];
                }
            }
            var actor = new Actor(name, this.actors.length);
            this.actors.push( actor );
            return actor;
        }

        signal(actorA, actorB, message): Signal {
            var signal = new Signal(actorA, actorB, message);
            this.signals.push( signal );
            return signal;
        }

    }


    export class Actor {
        name: string;
        index: number;

        constructor(name, index) {
            this.name = name;
            this.index = index;
        }
    }

    export class Signal {
        actorA: Actor;
        actorB: Actor;
        message: string;
        lineType: number;
        arrowType: number;

        constructor(actorA, actorB, message) {
            this.actorA = actorA;
            this.actorB = actorB;
            this.message = message;
        }

        isSelf(): boolean {
            return this.actorA.index === this.actorB.index;
        }
    }

}
