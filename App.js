import React from 'react';
import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    StatusBar,
    Picker,
    PermissionsAndroid,
} from 'react-native';

import {
    Header,
    LearnMoreLinks,
    Colors,
    DebugInstructions,
    ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import {
    Button,
    Appbar,
    TextInput,
    Text,
    Paragraph,
    Menu,
    Divider,
    Provider,
    Dialog,
    Portal,
    RadioButton,
    Snackbar,
} from 'react-native-paper';
import {Icon} from 'native-base';
import DocumentPicker from 'react-native-document-picker';

var RNFS = require('react-native-fs');


const plaintext = '.ABCDEFGHIJKLMNOPQRSTUVWXYZ';
// Rotor Wiring
const rotors = [];
rotors[1] = '.EKMFLGDQVZNTOWYHXUSPAIBRCJ';   // Rotor I
rotors[2] = '.AJDKSIRUXBLHWTMCQGZNPYFVOE';   // Rotor II
rotors[3] = '.BDFHJLCPRTXVZNYEIWGAKMUSQO';   // Rotor III
rotors[4] = '.ESOVPZJAYQUIRHXLNFTGKDCMWB';   // Rotor IV
rotors[5] = '.VZBRGITYUPSDNHLXAWMJQOFECK';   // Rotor V


//Knock points of rotors
const knockPoints = [];
knockPoints[1] = 17;//   Q - one knockpoint (R I)
knockPoints[2] = 5;   //   E - one knockpoint (R II)
knockPoints[3] = 22; //   V - one knockpoint (R III)
knockPoints[4] = 10; //   J - one knockpoint (R IV)
knockPoints[5] = 26; //   Z - one knockpoint (R V)

// Reflectors "B" and "C"  Wiring
const reflectors = [];
reflectors['b'] = '.YRUHQSLDPXNGOKMIEBFZCWVJAT';      // M3 B
reflectors['c'] = '.FVPJIAOYEDRZXWGCTKUQSBNMHL';      // M3 C


export default class App extends React.Component {
    state = {
        wheel1: 'A',
        wheel2: 'A',
        wheel3: 'A',

        ring1: 'A',
        ring2: 'A',
        ring3: 'A',

        wheelSelect1: 1,
        wheelSelect2: 2,
        wheelSelect3: 3,

        input: '',
        output: '',

        grouping: 4,
        visible: false,
        counter: 0,

        useReflector: 'b',
        msg_in: '',
        msg_out: '',
        visibleDialog: false,

        messageHappy: false,
        messageSad: false,
    };

    validateLetter = ch => {
        if (ch.length > 1) {
            ch = ch.charAt(ch.length - 1);
        }
        if (plaintext.indexOf(ch) < 1) {
            return '';
        } else {
            return ch;
        }
    };

    increaseRotor = (num) => {
        if (num == 1) {
            let i = plaintext.indexOf(this.state.wheel1);
            i++;
            if (i > 26) {
                i = 1;
            }
            let ch = plaintext.charAt(i);
            this.setState({wheel1: ch});
        }
        else if (num == 2) {
            let i = plaintext.indexOf(this.state.wheel2);
            i++;
            if (i > 26) {
                i = 1;
            }
            let ch = plaintext.charAt(i);
            this.setState({wheel2: ch});
        }
        else {
            let i = plaintext.indexOf(this.state.wheel3);
            i++;
            if (i > 26) {
                i = 1;
            }
            let ch = plaintext.charAt(i);
            this.setState({wheel3: ch});
        }
    };

    decreaseRotor = (num) => {
        if (num == 1) {
            let i = plaintext.indexOf(this.state.wheel1);
            i--;
            if (i < 1) {
                i = 26;
            }
            let ch = plaintext.charAt(i);
            this.setState({wheel1: ch});
        }
        else if (num == 2) {
            let i = plaintext.indexOf(this.state.wheel2);
            i--;
            if (i < 1) {
                i = 26;
            }
            let ch = plaintext.charAt(i);
            this.setState({wheel2: ch});
        }
        else {
            let i = plaintext.indexOf(this.state.wheel3);
            i--;
            if (i < 1) {
                i = 26;
            }
            let ch = plaintext.charAt(i);
            this.setState({wheel3: ch});
        }
    };

    rotateCogs = (r, m) => {
        var pr = plaintext.indexOf(this.state.wheel3);
        var pm = plaintext.indexOf(this.state.wheel2);
        var pl = plaintext.indexOf(this.state.wheel1);

        if (pr === knockPoints[r]) {
            // If the knockpoint on the right wheel is reached rotate middle wheel
            // But first check if it too is a knock point
            if (pm === knockPoints[m]) {
                // If the knockpoint on the middle wheel is reached rotate left wheel
                pl++;
            }
            pm++;
        } else {
            if (pm === knockPoints[m]) {
                // If the knockpoint on the middle wheel is reached rotate left AND middle wheels
                // (the double stepping mechanism)
                pl++;
                pm++;
            }
        }

        // Rotate right wheel (this wheel is always rotated).
        pr++;

        // If rotating brings us beyond "Z" (26), then start at "A" (1) again.
        if (pr > 26) {
            pr = 1;
        }
        if (pm > 26) {
            pm = 1;
        }
        if (pl > 26) {
            pl = 1;
        }

        // Display new values
        this.setState({
            wheel3: plaintext.charAt(pr), wheel2: plaintext.charAt(pm),
            wheel1: plaintext.charAt(pl),
        });


        return [pr, pm, pl];
    };

    validLetter = (n) => {
        if (n <= 0) {
            return (26 + n);
        } else if (n > 26) {

            return (n - 26);
        } else {
            return n;
        }
    };

    mapEachLetter = (number, ringstellung, wheelposition, wheel, pass) => {
        // Change number according to ringstellung (ring setting)
        // Wheel turns anti-clockwise (looking from right)
        number = number - ringstellung;

        // Check number is between 1 and 26
        number = this.validLetter(number);

        // Change number according to wheel position
        // Wheel turns clockwise (looking from right)
        number = number + wheelposition;

        // Check number is between 1 and 26
        number = this.validLetter(number);

        // Do internal connection 'x' to 'y' according to direction
        if (pass === 2) {
            // L->R
            let let1 = plaintext.charAt(number);
            number = rotors[wheel].indexOf(let1);
        } else {
            // R->L
            let let1 = rotors[wheel].charAt(number);
            number = plaintext.indexOf(let1);
        }

        /*
         * NOW WORK IT BACKWARDS : subtract where we added and vice versa
         */

        // Change according to wheel position (anti-clockwise)
        number = number - wheelposition;

        // Check number is between 1 and 26
        number = this.validLetter(number);

        // Change according to ringstellung (clockwise)
        number = number + ringstellung;

        // Check number is between 1 and 26
        number = this.validLetter(number);

        return number;
    };

    encipherText = () => {
        // Are the selected rotors all different?
        if (this.state.wheelSelect3 === this.state.wheelSelect2 ||
            this.state.wheelSelect3 === this.state.wheelSelect1 ||
            this.state.wheelSelect2 === this.state.wheelSelect1) {
            alert('Wheel Numbers must be unique. Eg: I II III not II II II');
            this.setState({input: ''});
            return false;
        }

        let ring3 = plaintext.indexOf(this.state.ring3);
        let ring2 = plaintext.indexOf(this.state.ring2);
        let ring1 = plaintext.indexOf(this.state.ring1);

        // Get input letter
        var letterinput = this.state.input.toUpperCase();

        if (letterinput.search(/[A-Z]/gi)) {
            // If input is not a letter [A-Z], then return false and do nothing
            // except clear and focus the letter input field
            this.setState({input: ''});
            return false;
        }

        // Rotate Wheels (wheel_r and wheel_m have knock points, so we pass them to function)
        var wheel_position = this.rotateCogs(this.state.wheelSelect3, this.state.wheelSelect2);

        // Wheel Starting Position
        var start_r = wheel_position[0];
        var start_m = wheel_position[1];
        var start_l = wheel_position[2];

        // Input
        var input = plaintext.indexOf(letterinput);

        // this.run_debug(0, input);

        // First Pass - Plugboard
        // var number = this.swapPlugs(input);
        var number = input;
        // this.run_debug(0, number);

        // First Pass - R Wheel
        number = this.mapEachLetter(number, ring3, start_r, this.state.wheelSelect3, 1);

        // this.run_debug(0, number);

        // First Pass - M Wheel
        number = this.mapEachLetter(number, ring2, start_m, this.state.wheelSelect2, 1);

        // this.run_debug(0, number);

        // First Pass - L Wheel
        number = this.mapEachLetter(number, ring1, start_l, this.state.wheelSelect1, 1);

        // this.run_debug(0, number);


        // Reflector
        var let1 = reflectors[this.state.useReflector].charAt(number);
        number = plaintext.indexOf(let1);

        // this.run_debug(0, number);


        // Second Pass - L Wheel
        number = this.mapEachLetter(number, ring1, start_l, this.state.wheelSelect1, 2);

        // this.run_debug(0, number);

        // Second Pass - M Wheel
        number = this.mapEachLetter(number, ring2, start_m, this.state.wheelSelect2, 2);

        // this.run_debug(0, number);

        // Second Pass - R Wheel
        number = this.mapEachLetter(number, ring3, start_r, this.state.wheelSelect3, 2);

        // this.run_debug(0, number);

        // Passes through ETW again

        // Second Pass - Plugboard
        // number = this.swapPlugs(number);

        // this.run_debug(1, number);

        // Convert value to corresponding letter
        var output = plaintext.charAt(number);

        // Build Message Strings for Input and Output
        let msg_in = this.state.msg_in;
        let msg_out = this.state.msg_out;
        let counter = this.state.counter;

        if (this.state.counter === this.state.grouping) {
            // Space out message in/out as letter blocks of X length (grouping)
            msg_in = msg_in + ' ';
            msg_out = msg_out + ' ';
            counter = 0;
        }
        //Increment the counter
        counter++;
        msg_in += letterinput;
        msg_out += output;

        // Spit out new string values
        this.setState({msg_in: msg_in, msg_out: msg_out, input: '', counter: counter, output: output});

        return true;
    };

    _openMenu = () => this.setState({visible: true});
    _closeMenu = () => this.setState({visible: false});
    _showDialog = () => this.setState({visibleDialog: true});
    _hideDialog = () => this.setState({visibleDialog: false});
    _goBack = () => console.log('Went back');
    _onSearch = () => console.log('Searching');
    _onMore = () => console.log('Shown more');


    writeFile = (text) => {
        var path = '/storage/emulated/0/Download/enciphered text.txt';
        console.log(path);
        // write the file
        RNFS.writeFile(path, text, 'utf8')
            .then((success) => {
                if (success) {
                    console.log('FILE WRITTEN!');
                    this.setState({messageHappy: true});
                } else {
                    console.log('FILE WRITE ERROR');
                    this.setState({messageSad: true});
                }

            })
            .catch((err) => {
                console.log(err.message);
                this.setState({messageSad: true});
            });
    };

    componentWillMount() {
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE)
            .then((granted1) => {
                if (granted1) {
                    //do nothing
                } else {
                    PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE])
                        .then((result) => {
                            if (result[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE]) {
                                //  showSuccess('Good to go');
                            } else {
                                alert('Storage permission needed to work correctly.');
                            }
                        });
                }
            }).catch((err) => {
            //handle error
        });
    };

    render() {
        return (
            <>
                <SafeAreaView>
                    <Appbar.Header style={{backgroundColor: 'black'}}>
                        <Appbar.Content title="Enigma Machine Simulator 🎰" subtitle="M3"/>


                        <Menu
                            visible={this.state.visible}
                            onDismiss={this._closeMenu}
                            anchor={<Button icon={'more-vert'} onPress={this._openMenu}
                                            type={'text'}
                                            mode={'contained'}
                                            dark={true}
                                            theme={'black'}
                                            style={{backgroundColor: 'black'}}

                            ></Button>}
                        >
                            {/*<Menu.Item onPress={this._showDialog} title="Change Reflector" />*/}
                            <Menu.Item onPress={() => {

                                DocumentPicker.pick({
                                    type: [DocumentPicker.types.plainText],
                                }).then((res) => {
                                    this.setState({visible: false});
                                    console.log(
                                        res.uri,
                                        res.type, // mime type
                                        res.name,
                                        res.size,
                                    );

                                    RNFS.readFile(res.uri, 'utf8')
                                        .then((contents) => {
                                            // log the file contents
                                            //todo vibhor khud krle ab
                                            console.log(contents);
                                            this.setState({msg_in: contents});
                                        })
                                        .catch((err) => {
                                            console.log(err.message, err.code);
                                        });

                                }).catch((err) => {
                                    if (DocumentPicker.isCancel(err)) {
                                        // User cancelled the picker, exit any dialogs or menus and move on
                                    }
                                });


                            }} title="Select File"/>
                            <Divider/>
                            {/*<Menu.Item onPress={() => {}} title="Plugboard Settings" />*/}
                        </Menu>

                    </Appbar.Header>
                    <Portal>
                        <Dialog
                            visible={this.state.visibleDialog}
                            onDismiss={this._hideDialog}>
                            <Dialog.Title>Select Reflector</Dialog.Title>
                            <Dialog.Content>
                                <View>
                                    <RadioButton
                                        value="b"
                                        status={this.state.useReflector == 'b' ? 'checked' : 'unchecked'}
                                        onPress={() => this.setState({useReflector: 'b'})}
                                    />
                                    <RadioButton
                                        value="c"
                                        status={this.state.useReflector == 'c' ? 'checked' : 'unchecked'}
                                        onPress={this.changeReflector}
                                    />
                                </View>
                            </Dialog.Content>
                            <Dialog.Actions>
                                <Button onPress={this._hideDialog}>Done</Button>
                            </Dialog.Actions>
                        </Dialog>
                    </Portal>
                    <ScrollView
                        contentInsetAdjustmentBehavior="automatic"
                        style={styles.scrollView}>
                        <View style={styles.body}>
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'center',
                                marginTop: 40,
                                marginBottom: 10,
                            }}>

                                <Icon
                                    name={'chevron-up-circle'}
                                    type={'MaterialCommunityIcons'}
                                    onPress={() => this.decreaseRotor(1)}
                                    style={{fontSize: 30, flex: 0.2, marginRight: 55, marginLeft: 55}}/>

                                <Icon
                                    name={'chevron-up-circle'}
                                    type={'MaterialCommunityIcons'}
                                    onPress={() => this.decreaseRotor(2)}
                                    style={{fontSize: 30, flex: 0.2, marginRight: 54}}/>

                                <Icon
                                    name={'chevron-up-circle'}
                                    type={'MaterialCommunityIcons'}
                                    onPress={() => this.decreaseRotor(3)}
                                    style={{fontSize: 30, flex: 0.2, marginRight: 50}}/>

                            </View>
                            <View style={{flexDirection: 'row', justifyContent: 'center', marginBottom: 10}}>
                                <TextInput
                                    style={{flex: 0.13, marginRight: 50}}
                                    mode={'outlined'}
                                    disabled={true}
                                    value={this.state.wheel1}
                                    onChangeText={text =>
                                        this.setState({
                                            wheel1: this.validateLetter(text.toUpperCase()),
                                        })
                                    }
                                />
                                <TextInput
                                    style={{flex: 0.13, marginRight: 50, textColor: '#000'}}
                                    mode={'outlined'}
                                    disabled={true}
                                    value={this.state.wheel2}
                                    onChangeText={text =>
                                        this.setState({
                                            wheel2: this.validateLetter(text.toUpperCase()),
                                        })
                                    }
                                />
                                <TextInput
                                    style={{flex: 0.13}}
                                    mode={'outlined'}
                                    disabled={true}
                                    value={this.state.wheel3}
                                    onChangeText={text =>
                                        this.setState({
                                            wheel3: this.validateLetter(text.toUpperCase()),
                                        })
                                    }
                                />
                            </View>
                            <View style={{flexDirection: 'row', justifyContent: 'center', marginBottom: 30}}>

                                <Icon
                                    name={'chevron-down-circle'}
                                    type={'MaterialCommunityIcons'}
                                    onPress={() => this.increaseRotor(1)}
                                    style={{fontSize: 30, flex: 0.2, marginRight: 55, marginLeft: 55}}/>

                                <Icon
                                    name={'chevron-down-circle'}
                                    type={'MaterialCommunityIcons'}
                                    onPress={() => this.increaseRotor(2)}
                                    style={{fontSize: 30, flex: 0.2, marginRight: 54}}/>

                                <Icon
                                    name={'chevron-down-circle'}
                                    type={'MaterialCommunityIcons'}
                                    onPress={() => this.increaseRotor(3)}
                                    style={{fontSize: 30, flex: 0.2, marginRight: 50}}/>

                            </View>


                            {/*select ring*/}
                            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                                <Text style={{flex: 0.7, marginRight: 40, fontSize: 19, alignSelf: 'center'}}>
                                    Wheel Settings:</Text>
                                <Picker
                                    style={{flex: 0.2, marginRight: 50}}

                                    selectedValue={this.state.wheelSelect1}
                                    onValueChange={(itemValue, itemIndex) =>
                                        this.setState({wheelSelect1: itemValue})
                                    }
                                    style={{height: 50, width: 80}}
                                >
                                    <Picker.Item label="I" value={1}/>
                                    <Picker.Item label="II" value={2}/>
                                    <Picker.Item label="III" value={3}/>
                                    <Picker.Item label="IV" value={4}/>
                                    <Picker.Item label="V" value={5}/>

                                </Picker>
                                <Picker
                                    style={{flex: 0.2, marginRight: 50}}

                                    selectedValue={this.state.wheelSelect2}
                                    onValueChange={(itemValue, itemIndex) =>
                                        this.setState({wheelSelect2: itemValue})
                                    }
                                    style={{height: 50, width: 80}}
                                >
                                    <Picker.Item label="I" value={1}/>
                                    <Picker.Item label="II" value={2}/>
                                    <Picker.Item label="III" value={3}/>
                                    <Picker.Item label="IV" value={4}/>
                                    <Picker.Item label="V" value={5}/>

                                </Picker>
                                <Picker
                                    style={{flex: 0.2, marginRight: 10}}

                                    selectedValue={this.state.wheelSelect3}
                                    onValueChange={(itemValue, itemIndex) =>
                                        this.setState({wheelSelect3: itemValue})
                                    }
                                    style={{height: 50, width: 80}}
                                >
                                    <Picker.Item label="I" value={1}/>
                                    <Picker.Item label="II" value={2}/>
                                    <Picker.Item label="III" value={3}/>
                                    <Picker.Item label="IV" value={4}/>
                                    <Picker.Item label="V" value={5}/>

                                </Picker>


                            </View>
                            {/*ringsetting*/}
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'center',
                                marginTop: 30,
                                marginBottom: 30,
                            }}>
                                <Text
                                    style={{flex: 0.45, marginRight: 30, fontSize: 20, alignSelf: 'center'}}>
                                    Ringstellung:
                                </Text>
                                <TextInput
                                    style={{flex: 0.13, marginRight: 50}}
                                    value={this.state.ring1}
                                    onChangeText={text =>
                                        this.setState({
                                            ring1: this.validateLetter(text.toUpperCase()),
                                        })
                                    }
                                />
                                <TextInput
                                    style={{flex: 0.13, marginRight: 50}}
                                    value={this.state.ring2}
                                    onChangeText={text =>
                                        this.setState({
                                            ring2: this.validateLetter(text.toUpperCase()),
                                        })
                                    }
                                />
                                <TextInput
                                    style={{flex: 0.13}}
                                    value={this.state.ring3}
                                    onChangeText={text =>
                                        this.setState({
                                            ring3: this.validateLetter(text.toUpperCase()),
                                        })
                                    }
                                />
                            </View>


                            <View>
                                <TextInput
                                    value={this.state.msg_in}
                                    mode={'outlined'}
                                    label={'Input Text'}
                                    style={{marginHorizontal: 20, marginTop: 20}}
                                    onChangeText={text =>
                                        this.setState({
                                            msg_in: text,
                                        })}
                                />
                            </View>
                            <View>
                                <Button
                                    mode={'contained'}
                                    onPress={() => {

                                        //feed characters one bye one into cipher
                                        let text = this.state.msg_in;
                                        this.setState({msg_in: '', msg_out: ''}, () => {
                                            let time = 100;
                                            for (let i = 0; i < text.length; i++) {
                                                let cin = this.validateLetter(text[i].toUpperCase());
                                                if (cin !== '') {
                                                    setTimeout(() => {
                                                        this.setState({
                                                            input: cin,

                                                        }, () => this.encipherText());
                                                    }, time);
                                                    time += 100;

                                                }
                                            }
                                        });

                                    }}
                                    style={{marginHorizontal: 20, marginTop: 20}}
                                    dark={true}
                                    color={'#000'}
                                >
                                    Encipher
                                </Button>

                            </View>
                            <View>
                                <TextInput
                                    value={this.state.msg_out}
                                    mode={'outlined'}
                                    label={'Output Text'}
                                    style={{marginHorizontal: 20, marginTop: 30, marginBottom: 20}}
                                    disabled={true}
                                />
                                <Button
                                    mode={'outlined'}
                                    style={{marginHorizontal: 20, marginTop: 20, marginBottom: 20}}
                                    dark={true}
                                    color={'#000'}
                                    onPress={() => this.writeFile(this.state.msg_out)}
                                > Save to File</Button>
                                <Snackbar
                                    visible={this.state.messageHappy}
                                    onDismiss={() => this.setState({messageHappy: false})}
                                >File Saved to Download!
                                </Snackbar>
                                <Snackbar
                                    visible={this.state.messageSad}
                                    onDismiss={() => this.setState({messageSad: false})}
                                >File Saved to Download!
                                </Snackbar>
                            </View>

                        </View>
                    </ScrollView>
                </SafeAreaView>
            </>
        );
    }

}

const styles = StyleSheet.create({
    scrollView: {
        backgroundColor: Colors.lighter,
    },
    body: {
        backgroundColor: Colors.white,
    },
});

// "react-native-vector-icons": "^6.6.0"
// "react-native-fs": "^2.14.1",

// debug {
//             signingConfig signingConfigs.debug
//         }
