import React from 'react';
import { Switch, Route, withRouter, NavLink} from 'react-router-dom';
import ServerIndexItem from './server_index_item';
import Modal from 'react-modal';
import ServerShowContainer from './server_show_container';
import SessionDetailContainer from '../session/session_detail_container';
import ServerUsersIndexContainer from './server_users_index_container';
import TextChannelContainer from '../textchannel/text_channel_container';
import TextChannelListContainer from '../textchannel/text_channel_list_container';
import FriendIndexContainer from '../friends/friends_index_container';
import DirectMessageIndexContainer from '../direct_message/direct_message_index_container';
import DirectMessageShowContainer from '../direct_message/direct_message_show_container';
import FriendLinkContainer from '../friends/friend_link_container';
import ServerNavContainer from './server_nav_container';


class ServerIndex extends React.Component {
  constructor(props){
    super(props);
    this.state = {update:'', createServerName: '', joinServerName: ''};
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleJoinServer = this.handleJoinServer.bind(this);
    this.handleCreateServer = this.handleCreateServer.bind(this);
    this.stopEvent = this.stopEvent.bind(this);
  }

  componentDidMount(){
    this.props.fetchServers();
    this.props.fetchUsers();
  }

  handleCreateServer(e){
    e.preventDefault();
    this.props.removeErrors();
    this.props.createServer(this.state.createServerName).then(
      server => {
        this.props.history.push(`/servers/${server.id}/textChannel/${server.text_channels[0]}`);
      }
    );
  }

  handleJoinServer(e){
    e.preventDefault();
    this.props.removeErrors();
    this.props.joinServer(this.state.joinServerName).then(
      server => {
        this.props.history.push(`/servers/${server.id}/textChannel/${server.text_channels[0]}`);
      }
    );
  }

  handleChange(type){
    return (e) => {
      this.setState({[type]: e.target.value});
    };
  }

  componentWillMount(){
    this.createSocket();
  }

  stopEvent(e){
    e.stopPropagation();
  }

  createSocket() {
    let cable = ActionCable.createConsumer();
    this.servers = cable.subscriptions.create({
      channel: 'ServerChannel'
    }, {
      connected: () => {},
      received: (serverId) => {
        if(this.props.serverIds.includes(String(serverId.serverId)) &&
          String(serverId.serverId) === this.props.location.pathname.slice(9, this.props.location.pathname.indexOf('/textChannel'))){
          this.props.history.push('/servers/@me');
          this.props.removeServer(serverId.serverId);
        } else if (this.props.serverIds.includes(String(serverId.serverId))){
          this.props.removeServer(serverId.serverId);
        } else {
          return;
        }
      }
    });
  }

  openModal(){
    this.props.receiveModal('serverFormModalOpen');
  }

  closeModal(type){
    return e => {
      e.stopPropagation();
      this.props.removeModal(type);
    };
  }

  render(){
    const servers = this.props.servers.map(server => (
      <ServerIndexItem key={server.id} server={server}/>
    ));

    const errorClass = this.props.errors.length ? 'main-server-errors' : 'non-active-error';

    const errors = this.props.errors.map((error,i) => (
      <span key={i}>{error}</span>
    ));

    return (
      <main id='main-container' onClick={this.closeModal('updateAndDeleteModal')}>
        <div className={errorClass}>
          {errors}
        </div>
        <div className='nav'>
          <div className='server-list'>
            <div className='server-item'>
              <NavLink className='me'
                activeClassName='active-server' to='/servers/@me'>
                <div className='server-item-name'><p>Friends</p></div>
                <div className='triangle'></div>
              </NavLink>
            </div>
            <div className='server-line'></div>
            {servers}
            <button className='server-form-button' onClick={this.openModal}>
              <p>+</p>
              <div className='server-item-name'>
                <p>Create or Join Server</p>
              </div>
              <div className='triangle'></div>
            </button>
            <div className='end-list-line'></div>
          </div>
        </div>

        <div className='secondary-container'>
          <div className='secondary-nav'>
            <Switch>
              <Route path='/servers/@me' component={FriendLinkContainer} />
              <Route path='/servers/:serverId' component={ServerShowContainer} />
            </Switch>
            <div className='text-channel-list'>
              <Switch>
                <Route path='/servers/@me' component={DirectMessageIndexContainer} />
                <Route path='/servers/:serverId/textChannel/:textChannelId'
                      component={TextChannelListContainer} />
              </Switch>
            </div>
            <Route path ='/servers' component={SessionDetailContainer}/>
          </div>
        </div>

        <div className='third-container'>
          <div className='third-nav'>
            <Switch>
              <Route path='/servers/:serverId/textChannel/:textChannelId'
                      component={ServerNavContainer} />
            </Switch>
          </div>
          <Switch>
            <Route exact path='/servers/@me' component={FriendIndexContainer} />
            <Route exact path='/servers/@me/:textChannelId' component={TextChannelContainer} />
            <Route path='/servers/:serverId' component={ServerUsersIndexContainer}/>
          </Switch>
        </div>

        <Modal style={{overlay:{ backgroundColor: 'rgba(0,0,0,.8)'} } }
          ariaHideApp={false}
          className={ { base:'',
            afterOpen: '',
            beforeClose: '' } } isOpen={this.props.serverFormModalOpen} >

          <div onClick={this.closeModal('serverFormModalOpen')} className='serverFormModal'>
            <main onClick={this.stopEvent} className='serverFormModal-container'>
              <h1>OH, ANOTHER SERVER HUH?</h1>

              <div className='serverForm-container'>
                <form className='createForm' onSubmit={this.handleCreateServer}>
                  <h1>Create</h1>
                  <p>{`Create a new server and invite your friends. It's free`}</p>
                  <label htmlFor='createServer'>SERVER NAME</label>
                  <input placeholder='Enter Server Name' id='createServer'
                        onChange={this.handleChange('createServerName')}
                        value={this.props.createServerName}></input>
                  <button className='serverFormModal-button blue'>
                    Create Server
                  </button>
                </form>

                <div className='serverFormModal-or'><p>or</p></div>

                <form className='joinForm' onSubmit={this.handleJoinServer}>
                  <h1>Join</h1>
                  <p>Enter the Server you want to join.</p>
                  <label htmlFor='joinServer'>SERVER NAME</label>
                  <input placeholder='Enter Server Name' id='joinServer'
                        onChange={this.handleChange('joinServerName')}
                        value={this.props.joinServerName}></input>
                  <button className='serverFormModal-button green'>
                  Join Server
                </button>
                </form>
              </div>
            </main>
          </div>
        </Modal>

      </main>
    );
  }
}

export default withRouter(ServerIndex);
