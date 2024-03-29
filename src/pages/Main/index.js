import React, { Component } from 'react';
import { Keyboard, ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';

import AsyncStorage from '@react-native-community/async-storage';

import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../../services/api';

import {
  Container,
  Form,
  Input,
  SubmitButton,
  List,
  User,
  Avatar,
  Name,
  Bio,
  ProfileButton,
  ProfileButtonText,
  DeleteButton,
  DeleteAllButton,
} from './styles';

export default class Main extends Component {
  static navigationOptions = {
    title: 'Users',
  };

  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    newUser: '',
    users: [],
    loading: false,
    loadingDelete: false,
  };

  async componentDidMount() {
    const users = await AsyncStorage.getItem('users');

    if (users) {
      this.setState({ users: JSON.parse(users) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { users } = this.state;

    if (prevState.users !== users) {
      AsyncStorage.setItem('users', JSON.stringify(users));
    }
  }

  handleAddUser = async () => {
    const { users, newUser } = this.state;

    this.setState({ loading: true });

    const response = await api.get(`/users/${newUser}`);

    const data = {
      name: response.data.name,
      login: response.data.login,
      bio: response.data.bio,
      avatar: response.data.avatar_url,
    };

    this.setState({
      users: [...users, data],
      newUser: '',
      loading: false,
    });

    Keyboard.dismiss();
  };

  handleDeleteUser = () => {
    const { deleteUser, users } = this.state;
    let index = 0;

    this.setState({ loadingDelete: true });

    users.forEach((el, i) => {
      if (el.login === deleteUser) {
        index = i;
      }
    });
    const newArray = [...users];

    newArray.splice(index, 1);

    this.setState({
      users: [...newArray],
      deleteUser: '',
      loadingDelete: false,
    });

    Keyboard.dismiss();
  };

  handleNavigate = user => {
    const { navigation } = this.props;

    navigation.navigate('User', { user });
  };

  handleDeleteAll = () => {
    const { users } = this.state;

    this.setState({
      users: [],
    });
  };

  render() {
    const { users, newUser, loading, deleteUser, loadingDelete } = this.state;
    return (
      <Container>
        <Form>
          <Input
            autoCorrect={false}
            autoCapitalize="none"
            placeholder="Add user"
            value={newUser}
            onChangeText={text => this.setState({ newUser: text })}
            returnKeyType="send"
            onSubmitEditing={this.handleAddUser}
          />
          <SubmitButton loading={loading} onPress={this.handleAddUser}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Icon name="add" size={20} color="#FFF" />
            )}
          </SubmitButton>
        </Form>
        <Form>
          <Input
            autoCorrect={false}
            autoCapitalize="none"
            placeholder="Delete user"
            value={deleteUser}
            onChangeText={text => this.setState({ deleteUser: text })}
            returnKeyType="send"
            onSubmitEditing={this.handleDeleteUser}
          />
          <DeleteButton
            loading={loadingDelete}
            onPress={() => this.handleDeleteUser(deleteUser)}
          >
            {loadingDelete ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Icon name="delete" size={20} color="#FFF" />
            )}
          </DeleteButton>
        </Form>
        <Form>
          <DeleteAllButton onPress={() => this.handleDeleteAll()}>
            <ProfileButtonText>Delete all</ProfileButtonText>
          </DeleteAllButton>
        </Form>
        <List
          data={users}
          keyExtractor={user => user.login}
          renderItem={({ item }) => (
            <User>
              <Avatar source={{ uri: item.avatar }} />
              <Name>{item.name}</Name>
              <Bio>{item.bio}</Bio>
              <ProfileButton onPress={() => this.handleNavigate(item)}>
                <ProfileButtonText>See profile</ProfileButtonText>
              </ProfileButton>
            </User>
          )}
        />
      </Container>
    );
  }
}
