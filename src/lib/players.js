import { callSendAPI, callApiSendMessage } from '../helpers/sendAPI';
import { sendTheMenu } from './utils';
import { searchPlayerName } from '../api/algolia';
import Firebase from '../api/firebase';

const Players = {};

Players.buildPreviewElement = (player) => {
  const button = {
    type: 'postback',
    title: `${ player.name } detail`,
    payload: `player_more_information.${ player.id }`,
  };

  const info = `Birthday: ${ player.dateOfBirth },
    National: ${ player.nationality },
    Club: ${ player.teamName },
    Position: ${ player.position }`;

  return {
    "title": `${player.firstName} ${player.lastName}`,
    "image_url": player.headshotImgUrl,
    "subtitle": info,
    "buttons":[JSON.stringify(button)]
  };
};

Players.sendPlayersInfomation = (senderId, players) => {
    const elements = players
    .filter((player, index) => index < 3)
    .map(player => Players.buildPreviewElement(player));

    const payload = {
      "template_type":"generic",
      "elements":elements
    };

    const response = {
      "attachment": {
        "type": "template",
        "payload": payload
      }
    };
    callSendAPI(senderId, response);
};

Players.findPlayersByName = (senderId, message) => {
  searchPlayerName(message)
  .then((hits) => {
    if (!hits || hits.length === 0) { sendTheMenu(senderId); return; }

    if (hits.length > 3) { callApiSendMessage(senderId, 'So many matches! I can not display all of them.'); }
    Players.sendPlayersInfomation(senderId, hits);
  })
  .catch((err) => {
    console.error(err);
  });
};

Players.sendPlayerFullDetail = (senderId, player) => {
  if (!player) { callApiSendMessage(senderId, 'Sorry! I can not find it out. Say fuck to Vinh Gâu Gâu!'); }

  const detail = `Full detail
  Player name: ${player.firstName} ${player.lastName}
  Common name: ${ player.commonName }
  Height: ${ player.height }
  Weight: ${ player.weight }
  Birthday: ${ player.dateOfBirth }
  Foot: ${ player.foot }
  Nationality: ${ player.nationality }
  Position: ${ player.position }
  Quality: ${ player.quality }
  Club: ${ player.teamAbbrName }`;

  callApiSendMessage(senderId, detail);
};

Players.playerDetailById = (senderId, playerId) => {
  if (!playerId || !senderId) { return; }
  Firebase.database.ref('players/' + playerId).once('value')
  .then((snapshot) => Players.sendPlayerFullDetail(senderId, snapshot.val()));
};

export default Players;
