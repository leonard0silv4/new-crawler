import { Button } from "@/components/ui/button";
import instance from "@/config/axios";
import { useModal } from "@/context/ModalContext";
import { useEffect, useState } from "react";

interface RateProps {
  ids: string[] | string;
  rateAc?: number;
}

const RatingDescription: Record<number, string> = {
  1: "Péssimo",
  2: "Muito ruim",
  3: "Ruim",
  4: "Insatisfatório",
  5: "Regular",
  6: "Satisfatório",
  7: "Bom",
  8: "Muito bom",
  9: "Excelente",
  10: "Perfeito",
};

const StarRating = ({ ids, rateAc }: RateProps) => {
  const [rating, setRating] = useState(rateAc ?? 0);

  const { closeModal } = useModal();

  const handleStarClick = (index: number) => {
    setRating(index + 1); // Atualiza a nota
  };

  const saveRate = () => {
    instance
      .put(`jobs/rate/`, {
        id: ids,
        value: rating,
      })
      .then((response) => {
        console.log(response);
        closeModal();
      });
  };

  return (
    <div className="flex flex-col justify-center content-center text-center">
      <div className="flex items-center">
        {[...Array(10)].map((_, index) => (
          <svg
            key={index}
            onClick={() => handleStarClick(index)}
            className={`w-8 h-8 ms-3 cursor-pointer ${
              index < rating
                ? "text-yellow-300"
                : "text-gray-300 dark:text-gray-500"
            }`}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 22 20"
          >
            <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
          </svg>
        ))}
      </div>

      <p className="my-3 font-medium text-xl">
        {rating && (
          <>
            Classificação: {rating} - {RatingDescription[rating] || ""}
          </>
        )}
      </p>

      <div>
        <Button onClick={() => saveRate()}>Salvar nota</Button>
      </div>
    </div>
  );
};

export default StarRating;
