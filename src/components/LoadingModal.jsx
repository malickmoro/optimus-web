import { AnimatePresence, motion } from 'framer-motion';

const LoadingModal = ({ isLoading }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="p-6 rounded shadow-md flex flex-col items-center">
            {/* The icon now has a class that colors it rebbupurple */}
            <i className="bx bx-loader bx-spin text-4xl mb-4 text-rebbupurple"></i>
            <p className="text-lg font-semibold">Processing...</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingModal;
