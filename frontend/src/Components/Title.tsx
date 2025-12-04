import { motion as Motion } from 'framer-motion';

const Title = ({ text1, text2 }) => {
  return (
    <Motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='inline-flex flex-wrap items-center gap-3 sm:gap-4 mb-6'
    >
      <p className='text-xl sm:text-2xl text-gray-500 font-light tracking-wide'>
        {text1}{' '}
        <span className='text-gray-900 font-semibold'>{text2}</span>
      </p>
      <div className='flex-grow h-[1.5px] sm:h-[2px] bg-gray-300 max-w-[80px] sm:max-w-[120px] rounded'></div>
    </Motion.div>
  );
};

export default Title;
