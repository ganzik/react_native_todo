import React, { Component } from 'react';

import {
  Platform,
  StyleSheet,
  Text,
  View,
  StatusBar,
  TextInput,
  Dimensions,
  AsyncStorage
} from 'react-native';
import ToDo from './ToDo';
import { AppLoading } from 'expo';
import { ScrollView } from 'react-native-gesture-handler';
import uuidv1 from 'uuid/v1';

const { height, width } = Dimensions.get('window');

export default class App extends Component {
  state = {
    newToDo: '',
    loadedToDos: false,
    toDos: {}
  };
  componentDidMount = () => {
    this._loadTodos();
  };
  render() {
    const { newToDo, loadedToDos, toDos } = this.state;
    console.log(toDos);
    if (!loadedToDos) {
      return <AppLoading />;
    }
    return (
      <View style={styles.container}>
        <StatusBar barStyle='light-content' />
        <Text style={styles.title}>To Do</Text>
        <View style={styles.card}>
          {/* autoCorrect 자동완성 기능, returnKeyType 리턴 키 이름 지정 */}
          <TextInput
            style={styles.input}
            placeholder={'New to do'}
            value={newToDo}
            onChangeText={this._controlNewToDo}
            placeholderTextColor={'#999'}
            returnKeyType={'done'}
            autoCorrect={false}
            onSubmitEditing={this._addToDo}
            underlineColorAndroid={'transparent'}
          />
          <ScrollView contentContainerStyle={styles.toDos}>
            {Object.values(toDos).map(toDo => (
              <ToDo
                key={toDo.id}
                {...toDo}
                deleteToDo={this._deleteToDo}
                uncompleteToDo={this._uncompleteToDo}
                completeToDo={this._completeToDo}
                updateToDo={this._updateToDo}
              />
            ))}
          </ScrollView>
        </View>
      </View>
    );
  }
  _controlNewToDo = text => {
    this.setState({
      newToDo: text
    });
  };

  _loadTodos = async () => {
    try {
      const toDos = await AsyncStorage.getItem('toDos');
      const parsedToDos = JSON.parse(toDos);
      console.log(toDos);
      this.setState({
        loadedToDos: true,
        toDos: parsedToDos || {}
      });
    } catch (error) {
      console.log(error);
    }
  };

  _addToDo = () => {
    const { newToDo } = this.state;
    if (newToDo !== '') {
      this.setState(prevState => {
        const ID = uuidv1();
        const newToDoObject = {
          [ID]: {
            id: ID,
            isCompleted: false,
            text: newToDo,
            createdAt: Date.now()
          }
        };
        const newState = {
          ...prevState,
          newToDo: '',
          toDos: {
            ...newToDoObject,
            ...prevState.toDos
          }
        };
        this._saveToDos(newState.toDos);
        return { ...newState };
      });
    }
  };

  // ToDo 목록에서 id를 인자로 받아 리스트에서 삭제
  _deleteToDo = id => {
    // prevState를 인자로 받아와서 setState를 한다.
    this.setState(prevState => {
      // 기존 상태값의 toDos값을 toDos로 선언한다.
      const toDos = prevState.toDos;
      // doDos리스트에서 id값이 동일한 것을 삭제한다
      delete toDos[id];
      // 기존 상태값과 id가 삭제된 toDos를 newState에 담는다
      const newState = {
        ...prevState,
        ...toDos
      };
      this._saveToDos(newState.toDos);
      // newState를 반환하여 setState해준다
      return { ...newState };
    });
  };

  _uncompleteToDo = id => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id]: {
            ...prevState.toDos[id],
            isCompleted: false
          }
        }
      };
      this._saveToDos(newState.toDos);
      return { ...newState };
    });
  };

  _completeToDo = id => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id]: {
            ...prevState.toDos[id],
            isCompleted: true
          }
        }
      };
      this._saveToDos(newState.toDos);
      return { ...newState };
    });
  };

  _updateToDo = (id, text) => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id]: {
            ...prevState.toDos[id],
            text: text
          }
        }
      };
      this._saveToDos(newState.toDos);
      return { ...newState };
    });
  };

  _saveToDos = newToDos => {
    // console.log(JSON.stringify(newToDos));
    const toDos = JSON.stringify(newToDos);
    const saveToDos = AsyncStorage.setItem('toDos', toDos);
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F23657'
  },
  title: {
    color: 'white',
    fontSize: 30,
    fontWeight: '400',
    marginTop: 50,
    marginBottom: 30
  },
  card: {
    backgroundColor: 'white',
    flex: 1,
    width: width - 25,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: 'rgb(50, 50, 50)',
        shadowOpacity: 0.5,
        shadowRadius: 5,
        shadowOffset: {
          height: -1,
          width: 0
        }
      },
      android: {
        elevation: 3
      }
    })
  },
  input: {
    padding: 20,
    borderBottomColor: '#bbb',
    borderBottomWidth: StyleSheet.hairlineWidth,
    fontSize: 25
  },
  toDos: {
    alignItems: 'center'
  }
});
