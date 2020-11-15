'use strict';
import * as vscode from 'vscode';
// import * as path from 'path';
import {spawn} from 'child_process';


const util = require('util');
const exec = util.promisify(require('child_process').exec);

let player: AudioPlayer;
let listener: EditorListener;
let extensionPos: number;
let isActive: boolean;
var musicPlayer = require('play-sound')({})

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "keyboard-sounds" is now active!');


    // to avoid multiple different instances
    player = player || new AudioPlayer();
    listener = listener || new EditorListener(player);
    context.subscriptions.push(listener);
}

// this method is called when your extension is deactivated
export function deactivate() 
{
}

/**
 * Listen to editor changes and play a sound when a key is pressed.
 */
export class EditorListener {
    private _disposable: vscode.Disposable;
    private _subscriptions: vscode.Disposable[] = [];
    // private _basePath: string = path.join(__dirname, '..', '..');
    // private _spaceAudio: string = path.join(this._basePath, 'audio', 'spacebar_press.mp3');
    // private _deleteAudio: string = path.join(this._basePath, 'audio', 'delete_press.mp3');
    // private _otherKeysAudio: string = path.join(this._basePath, 'audio', 'key_press.mp3');

    constructor(private player: AudioPlayer) {
        vscode.workspace.onDidChangeTextDocument(this._keystrokeCallback, this, this._subscriptions);
        this._disposable = vscode.Disposable.from(...this._subscriptions);
    }

    _keystrokeCallback(e : vscode.TextDocumentChangeEvent) {

        let pressedKey = e.contentChanges[0].text;
        if (pressedKey == "") {
			// this.player.play(this._deleteAudio);
			vscode.window.showInformationMessage("Backspace")
        } else if (pressedKey == " ") {
			// this.player.play("C:\\Users\\Ayush Singh\\Music\\atlas.mp3");
			vscode.window.showInformationMessage("space")
			// musicPlayer.play("C:\\Users\\Ayush Singh\\Music\\atlas.mp3", function(err: String){
			// 	if (err)
			// 	{
			// 		vscode.window.showErrorMessage(err.toString())
			// 	}
			//   })


			
			try {
				exec('mplayer "C:\\Users\\Ayush Singh\\Music\\atlas.mp3" ')
			}
			catch (err)
			{
				vscode.window.showErrorMessage(err)
			}
			  
		}
		 else {
			vscode.window.showInformationMessage(pressedKey)
        }
    }

    dispose() {
        this._disposable.dispose();
    }
};

/**
 * Audio player for keystroke sounds
 */
export class AudioPlayer {
    private _process: any = undefined;
    private _stopped: boolean = true;

    play(filePath: string) {
        // stop mplayer before play again to avoid delays
        if (!this._stopped) {
            this.stop()
        }

        this._stopped = false;
        let args = ["-ao", "alsa", "-volume", "100", filePath];

        // spawn let us communicate with our child process
        // TODO: spawn every time a key is pressed not seems good,
        // maybe change this create just one child for the object
        // and use it to play the file multiple times.
        this._process = spawn('mplayer', args);

        // see if an error occours
        this._process.on('error', function (err :vscode.WorkspaceConfiguration) {
            if (err.code == "ENOENT") {
                // error no entry (file/directory)
                vscode.window.showErrorMessage("Keyboard Sounds: Apparently you do not have 'mplayer' installed on your $PATH, see README for more information")
            } else {
                vscode.window.showErrorMessage("Keyboard Sounds: Something went wrong!!!")
            }
        });
    }

    stop() {
        if (this._process) {
            this._process.kill('SIGTERM');
        }
        this._stopped = true;
    }
}