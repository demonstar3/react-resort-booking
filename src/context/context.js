import React, { createContext, useEffect } from "react";
import items from "../data";
import useAsyncState from "../utils/useAsyncState";

const RoomContext = createContext();

const RoomProvider = ({ children }) => {
  const [state, setState] = useAsyncState({
    rooms: [],
    sortedRooms: [],
    featuredRooms: [],
    loading: true,
    type: "all",
    capacity: 1,
    price: 0,
    minPrice: 0,
    maxPrice: 0,
    minSize: 0,
    maxSize: 0,
    breakfast: false,
    pets: false
  });

  const formatData = items => {
    let tempItems = items.map(item => {
      let id = item.sys.id;
      let images = item.fields.images.map(image => image.fields.file.url);

      let room = { ...item.fields, images: images, id };
      return room;
    });
    return tempItems;
  };

  const getRoom = slug => {
    let tempRooms = [...state.rooms];
    const singleRoom = tempRooms.find(room => room.slug === slug);
    return singleRoom;
  };

  const handleChange = async event => {
    const target = event.target;
    const value = event.type === "checkbox" ? target.checked : target.value;
    const name = event.target.name;

    await setState(prevState => {
      return { ...prevState, [name]: value };
    });
  };

  useEffect(() => {
    let rooms = formatData(items);
    let featuredRooms = rooms.filter(room => room.featured === true);
    let maxPrice = Math.max(...rooms.map(item => item.price));
    let maxSize = Math.max(...rooms.map(item => item.size));

    setState(prevState => {
      return {
        ...prevState,
        rooms: rooms,
        featuredRooms: featuredRooms,
        sortedRooms: rooms,
        loading: false,
        price: maxPrice,
        maxPrice: maxPrice,
        maxSize: maxSize
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let {
      rooms,
      type,
      capacity,
      price,
      minSize,
      maxSize,
      breakfast,
      pets
    } = state;

    let tempRooms = [...rooms];

    // filter by type
    if (type !== "all") {
      tempRooms = tempRooms.filter(room => room.type === type);
    }

    setState(prevState => {
      return { ...prevState, sortedRooms: tempRooms };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.type]);

  return (
    <RoomContext.Provider
      value={{ ...state, getRoom: getRoom, handleChange: handleChange }}
    >
      {children}
    </RoomContext.Provider>
  );
};

const RoomConsumer = RoomContext.Consumer;

const withRoomConsumer = Component => {
  const ConsumerWrapper = props => (
    <RoomConsumer>
      {value => <Component {...props} context={value} />}
    </RoomConsumer>
  );

  return ConsumerWrapper;
};

export { RoomProvider, RoomContext, withRoomConsumer };
