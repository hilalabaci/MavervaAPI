import { Request, Response } from "express";

export const addLabel = async (req: Request, res: Response): Promise<void> => {
  //   const { colour, cardId, add } = req.body;
  //   const card = await Card.findById(cardId)
  //     .populate<{ labels: LabelType[] }>("labels")
  //     .populate<{ userId: IUser }>("userId");
  //   if (!card) {
  //     res.status(400).json({
  //       message: "Card not found",
  //     });
  //     return;
  //   }
  //   const labelExists = card.labels?.find((label) => label.colour === colour);
  //   if (labelExists) {
  //     /* remove label */
  //     if (!add) {
  //       card.labels = card.labels.filter(
  //         (label) => label._id !== labelExists._id,
  //       );
  //       await card.save();
  //       await Label.deleteOne({ _id: labelExists._id });
  //       const cardToReturn = await card.populate("labels");
  //       res.json(cardToReturn);
  //       return;
  //     }
  //     res.json(card);
  //     return;
  //   }
  //   if (!labelExists && !add) {
  //     res.json(card);
  //     return;
  //   }
  //   /* Add label */
  //   const newLabel = new Label({
  //     colour: colour,
  //     cardId: cardId,
  //   });
  //   await newLabel.save();
  //   card.labels.push(newLabel);
  //   await card.save();
  //   let cardsToReturn = await card.populate("labels");
  //   cardsToReturn = await cardsToReturn.populate("userId");
  //   res.json(cardsToReturn.toJSON());
  // };
  // export const getLabels = async (req: Request, res: Response): Promise<void> => {
  //   const filter = { cardId: req.query.cardId };
  //   const all = await Label.find(filter);
  //   res.json(all);
  // };
  // export const deleteLabel = async (
  //   req: Request,
  //   res: Response,
  // ): Promise<void> => {
  //   const id = req.query.id;
  //   await Label.deleteOne({ _id: id });
  //   res.sendStatus(200);
};
