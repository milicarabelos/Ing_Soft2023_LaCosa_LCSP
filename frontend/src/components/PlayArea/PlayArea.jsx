import Card from '../../components/Card/Card.jsx';
import {useEffect, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {
	removeFromHand,
	addToDiscardPile,
	setPlayerInGame as updatePlayers,
	addToPlayArea,
	cleanPlayArea,
} from '../../appActions';
import playCard from '../request/playCard';
import {Box} from '@chakra-ui/react';
import getGameStatus from '../request/getGameStatus';

const PlayArea = () => {
	const dispatch = useDispatch();

	const selectedCard = useSelector((state) => state.hand.selectedCard);
	const playedCard = useSelector((state) => state.playArea.card);
	const [displayCard, setDisplayCard] = useState('');

	const idPlayer = JSON.parse(sessionStorage.getItem('player')).id;

	/*
		When clicking on the play area, the selected card is played (if there is one)
		Playing a card consists of removing it from the player's hand and adding it to the play area.
		Play area gets cleaned after 1 second.

	/* When a card enters the play area, resolve its effects */
	useEffect(() => {
		// prevent applyCardEffect from running when playedCard changes state
		// but it's not a valid card -> caused by react strict mode
		if (!playedCard) {
			console.log('Error: invalid play');
			return;
		}

		const applyCardEffect = async () => {
			// eslint-disable-next-line no-unused-vars
			const res = await playCard({
				playedCard: playedCard.card,
				idPlayer,
				targetId: playedCard.target,
			});
			const gameStatus = await getGameStatus(idPlayer);
			const cardEffect = gameStatus.players;
			dispatch(updatePlayers(cardEffect));
		};

		applyCardEffect();
		setDisplayCard(playedCard.card);
		// if card came from the deck this does nothing
		dispatch(removeFromHand(playedCard.card));

		setTimeout(() => {
			setDisplayCard('');
			dispatch(cleanPlayArea());
			dispatch(addToDiscardPile(playedCard.card));
		}, 500);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [playedCard]);

	/*
		When clicking on the play area, the selected card is dispatched to the
		play area (if there is one).
		Cards played on the play area have no target, so target is set to -1.
	*/
	const handleClick = async () => {
		if (selectedCard) {
			dispatch(addToPlayArea({card: selectedCard, target: -1}));
		}
	};

	// display card in play area. If card is empty, display nothing
	return (
		<Box w='100%' h='100%' className='play-area' onClick={handleClick}>
			{displayCard && <Card info={displayCard} front={true} />}
		</Box>
	);
};

export default PlayArea;
