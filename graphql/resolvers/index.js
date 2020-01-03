const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');

const events = async eventIds => {
    try {
        const events = await Event.find({ _id: {$in: eventIds} });
    
        return events.map(event => 
            (
                { 
                    ...event._doc, 
                    _id: event.id,
                    date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this, event.creator) 
                }
            )
        );
    } catch(err) {
        throw err;
    }
};

const user = async userId => {
    try {
        const user = await User.findById(userId);
    
        return { 
            ...user._doc, 
            id: user.id, 
            createdEvents: events.bind(this, user._doc.createdEvents) 
        };
    } catch {
        throw err;
    }
};

module.exports = {
    events: async () => {
        try {
            const events = await Event.find();
            return events.map(event => 
                (
                    { 
                        ...event._doc, 
                        _id: event._doc._id.toString(),
                        date: new Date(event._doc.date).toISOString(),
                        creator: user.bind(this, event._doc.creator)
                    }
                )
            );
        } catch(err){
            throw err;
        }
    },
    createEvent: async (args) => {
        const { title, description, price, date } = args.eventInput;
        
        const event = new Event({
            title,
            description,
            price,
            date: new Date(date),
            creator: '5e0b64c0ff7afe1cd0c0b81d'
        });
        
        try {
            const result = await event.save();
            const createdEvent = { 
                ...result._doc, 
                id: result._doc._id.toString(),
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, result._doc.creator) 
            };
            const creator = await User.findById('5e0b64c0ff7afe1cd0c0b81d');
            if (!creator){
                throw new Error('User not found.');
            }
            creator.createdEvents.push(event);
            await creator.save();
            return createdEvent;
        } catch(err) {
            throw err;
        }
    },
    createUser: async args => {
        const { email, password } = args.userInput;

        try {
            const existingUser =  await User.findOne({ email });
    
            if (existingUser) {
                throw new Error('User exists already.')
            }
            const hashedPassword = await bcrypt.hash(password, 12);
            const user = new User({
                email,
                password: hashedPassword,
            });
            const result = await user.save();
            return { 
                ...result._doc, 
                password: null, 
                _id: result.id 
            };
        } catch(err) {
            throw err;
        }
    },
};