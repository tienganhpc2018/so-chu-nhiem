import React, { useState, useEffect, useRef } from 'react';
import { UfoCityBackground } from './UfoCityBackground';
import { UfoSaucer } from './UfoSaucer';
import { UfoStudentSprite } from './UfoStudentSprite';
import { UFO_SPEECH_QUOTES } from '../data/defaultUfoData';
import { ufoAudio } from '../utils/ufoAudio';
import { getShortStudentName } from '../utils/nameHelper';

export const UfoArena = ({
  students = [],
  pickCount = 2,
  isRunning = false,
  onCompleteCapture,
  calledStudentIds = []
}) => {
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 1200, height: 700 });
  const [studentSprites, setStudentSprites] = useState([]);
  const [capturedCount, setCapturedCount] = useState(0);
  const [targetStudentPos, setTargetStudentPos] = useState(null);
  const [isBeaming, setIsBeaming] = useState(false);
  const [isUfoVisible, setIsUfoVisible] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(null);

  const animFrameRef = useRef(null);
  const isRunningRef = useRef(isRunning);
  isRunningRef.current = isRunning;

  // Lấy kích thước container responsive
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth || 1200,
          height: containerRef.current.clientHeight || 700
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Khởi tạo các học sinh với tên chuẩn, vị trí và góc nghiêng tự nhiên
  useEffect(() => {
    if (!students || students.length === 0) return;

    const width = containerSize.width || 1200;
    const height = containerSize.height || 700;
    const roadY = height * 0.84;

    const sprites = students.map((std, idx) => {
      const x = 70 + ((idx * 37) % (width - 140));
      const vx = (Math.random() > 0.5 ? 1 : -1) * (1.0 + Math.random() * 1.6);
      return {
        student: std,
        x,
        y: roadY + (Math.random() * 20 - 10),
        baseY: roadY,
        vx,
        isTargeted: false,
        isAbducted: false,
        isFallen: false,
        speechQuote: null,
        gender: idx % 2 === 0 ? 'male' : 'female',
        rotation: (Math.random() * 16 - 8), // Nghiêng nhẹ tự nhiên khi chạy
        opacity: 1,
        scale: 1
      };
    });

    setStudentSprites(sprites);
    setCapturedCount(0);
    setTargetStudentPos(null);
    setIsBeaming(false);
    setIsUfoVisible(false);
    setCountdownSeconds(null);
  }, [students, containerSize.width, containerSize.height]);

  // Luồng bong bóng thoại học đường khi đang chơi vui vẻ bình thường
  useEffect(() => {
    const speechTimer = setInterval(() => {
      if (isRunningRef.current) return;
      setStudentSprites(prev => {
        if (prev.length === 0) return prev;
        const randomIdx = Math.floor(Math.random() * prev.length);
        const quotes = [
          'Hôm nay trời đẹp ghê!',
          'Tối qua cày phim tới 2h sáng đuối ghê!',
          'Điện thoại mới mua chụp hình nét ghê!',
          'Hết tiết này đi uống trà sữa không?',
          'Vừa ăn bánh mì ngon xỉu!',
          'Hôm nay chắc không gọi tên mình đâu hihi!',
          'Ngồi nói chuyện xíu có ai thấy đâu!'
        ];
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        return prev.map((s, idx) => {
          if (idx === randomIdx) {
            return { ...s, speechQuote: randomQuote };
          }
          return s.speechQuote ? { ...s, speechQuote: null } : s;
        });
      });
    }, 4000);

    return () => clearInterval(speechTimer);
  }, []);

  // Vòng lặp vật lý: chuyển động chạy, nghiêng ngã, nhào lộn theo sức hút UFO
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      setStudentSprites(prev => {
        const width = containerSize.width || 1200;
        const centerX = width / 2;

        return prev.map(item => {
          if (item.isAbducted) return item;

          let newX = item.x;
          let newVx = item.vx;
          let newRotation = item.rotation;

          if (isRunningRef.current) {
            // Khi UFO bật lực hút: Cơn bão trọng lực kéo các bạn học sinh về phía tâm đĩa bay
            const distToCenter = centerX - item.x;
            const gravityPull = Math.sign(distToCenter) * 35 * dt;

            // Chạy nhanh tán loạn hoặc bị hút nghiêng ngả
            newX += (item.vx * 75 * dt) + gravityPull;

            // Góc nghiêng ngã chao đảo mạnh theo sức hút
            if (item.isTargeted) {
              newRotation = Math.sin(currentTime * 0.03) * 25; // Run sợ lắc lư
            } else if (item.isFallen) {
              newRotation = item.vx > 0 ? 70 : -70; // Ngã lăn quay ra đường
            } else {
              newRotation = (item.vx > 0 ? 30 : -30) + Math.sin(currentTime * 0.015 + item.x) * 15;
            }
          } else {
            // Bình thường: Chạy nhẹ nhàng thư thả
            newX += item.vx * 40 * dt;
            newRotation = Math.sin(currentTime * 0.006 + item.x) * 8;
          }

          // Chạm mép thành phố thì quay đầu
          if (newX < 60) {
            newX = 60;
            newVx = Math.abs(newVx);
          } else if (newX > width - 60) {
            newX = width - 60;
            newVx = -Math.abs(newVx);
          }

          const bounce = Math.sin(currentTime * 0.008 + item.x) * 3;

          return {
            ...item,
            x: newX,
            y: item.baseY + bounce,
            vx: newVx,
            rotation: newRotation
          };
        });
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [containerSize.width]);

  // Kịch bản hồi hộp 15 giây khi giáo viên bấm Bắt đầu (Đúng yêu cầu Thầy)
  useEffect(() => {
    if (!isRunning) {
      setIsUfoVisible(false);
      setIsBeaming(false);
      setTargetStudentPos(null);
      setCountdownSeconds(null);
      return;
    }

    const availableStudents = studentSprites.filter(s => !s.isAbducted);
    if (availableStudents.length === 0) return;

    // Chọn ngẫu nhiên X bạn (ưu tiên bạn chưa được gọi)
    let uncalled = availableStudents.filter(s => !calledStudentIds.includes(s.student.id));
    if (uncalled.length < pickCount) {
      uncalled = [...availableStudents];
    }
    const shuffled = [...uncalled].sort(() => Math.random() - 0.5);
    const toCapture = shuffled.slice(0, Math.min(pickCount, shuffled.length));

    // Đếm ngược 15 giây
    setCountdownSeconds(15);
    const countTimer = setInterval(() => {
      setCountdownSeconds(prev => (prev !== null && prev > 1 ? prev - 1 : 0));
    }, 1000);

    // BƯỚC 1: ĐĨA BAY XUẤT HIỆN TỪ VŨ TRỤ (0s - 2.5s)
    setIsUfoVisible(true);
    ufoAudio.playUfoDescent();

    // BƯỚC 2: BẬT TIA HÚT VÀ CƠN BÃO TRỌNG LỰC NGHIÊNG NGẢ (2.5s - 8.5s)
    const beamTimeout = setTimeout(() => {
      setIsBeaming(true);
      ufoAudio.playTractorBeam();

      // Khiến các học sinh nghiêng ngả, ngã nhào lộn vì lực hút
      setStudentSprites(prev =>
        prev.map((s, idx) => {
          const isFallen = idx % 4 === 0;
          const quotes = [
            'Cứu tui với!! Gió hút mạnh quá!!',
            'Đừng bắt em mà đĩa bay ơi!!',
            'Sao Hỏa lạnh lắm tha cho em đi!',
            'Thầy ơi em hứa mai học bài đầy đủ!!',
            'Trời ơi ai giật tui ngã vậy nè?!'
          ];
          return {
            ...s,
            isFallen,
            rotation: isFallen ? (s.vx > 0 ? 65 : -65) : (s.vx > 0 ? 35 : -35),
            speechQuote: idx % 3 === 0 ? quotes[idx % quotes.length] : null
          };
        })
      );

      // Radar quét tìm mục tiêu
      const radarPing1 = setTimeout(() => ufoAudio.playRadarSweep(), 1500);
      const radarPing2 = setTimeout(() => ufoAudio.playRadarSweep(), 3500);

      // BƯỚC 3: KHÓA TIA LASER ĐỎ VÀO MỤC TIÊU HỒI HỘP (8.5s - 11.5s)
      const lockTimeout = setTimeout(() => {
        const firstTarget = toCapture[0];
        if (!firstTarget) return;

        setTargetStudentPos({ x: firstTarget.x, y: firstTarget.y });
        ufoAudio.playLockOn();

        // Bạn bị chọn hoảng hốt đứng run rẩy, các bạn khác tản ra né
        setStudentSprites(prev =>
          prev.map(s => {
            if (s.student.id === firstTarget.student.id) {
              return {
                ...s,
                isTargeted: true,
                speechQuote: 'Chết tui rồi, trúng tui rồi bà con ơi!!'
              };
            }
            return {
              ...s,
              speechQuote: s.speechQuote ? null : s.speechQuote
            };
          })
        );

        // BƯỚC 4: HÚT NHÀO LỘN BAY VÀO TRONG KHOANG ĐĨA BAY (11.5s - 14.5s)
        const abductTimeout = setTimeout(() => {
          ufoAudio.playAbductWhoosh();

          // Kéo bạn thứ nhất nhào lộn 720 độ, bay lên và biến mất vào trong khoang bụng đĩa bay
          setStudentSprites(prev =>
            prev.map(s => {
              if (s.student.id === firstTarget.student.id) {
                return {
                  ...s,
                  isTargeted: false,
                  isAbducted: true,
                  x: containerSize.width / 2,
                  y: 120, // Cửa khoang đáy đĩa bay
                  rotation: 720, // Nhào lộn tròn
                  scale: 0.1, // Thu nhỏ vào trong khoang
                  opacity: 0 // Biến mất hoàn toàn vào trong UFO
                };
              }
              return s;
            })
          );
          setCapturedCount(1);

          // Nếu cần bắt thêm bạn thứ 2 (nếu pickCount >= 2)
          if (toCapture.length > 1) {
            const secondTarget = toCapture[1];
            setTimeout(() => {
              setTargetStudentPos({ x: secondTarget.x, y: secondTarget.y });
              ufoAudio.playLockOn();
              setStudentSprites(prev =>
                prev.map(s =>
                  s.student.id === secondTarget.student.id
                    ? { ...s, isTargeted: true, speechQuote: 'Tha em với!!' }
                    : s
                )
              );

              setTimeout(() => {
                ufoAudio.playAbductWhoosh();
                setStudentSprites(prev =>
                  prev.map(s => {
                    if (s.student.id === secondTarget.student.id) {
                      return {
                        ...s,
                        isTargeted: false,
                        isAbducted: true,
                        x: containerSize.width / 2,
                        y: 120,
                        rotation: -720,
                        scale: 0.1,
                        opacity: 0
                      };
                    }
                    return s;
                  })
                );
                setCapturedCount(toCapture.length);
              }, 1200);
            }, 800);
          }

          // BƯỚC 5: KẾT THÚC VÀ CÔNG BỐ CHIẾN THẮNG (Khoảng 15 giây)
          const finishTimeout = setTimeout(() => {
            setIsBeaming(false);
            setTargetStudentPos(null);
            ufoAudio.playVictory();

            setTimeout(() => {
              clearInterval(countTimer);
              onCompleteCapture?.(toCapture.map(q => ({
                ...q.student,
                shortName: getShortStudentName(q.student.name || q.student.full_name, students)
              })));
            }, 800);
          }, toCapture.length > 1 ? 2600 : 1600);

          return () => clearTimeout(finishTimeout);
        }, 2800);

        return () => clearTimeout(abductTimeout);
      }, 5500);

      return () => {
        clearTimeout(radarPing1);
        clearTimeout(radarPing2);
        clearTimeout(lockTimeout);
      };
    }, 2500);

    return () => {
      clearInterval(countTimer);
      clearTimeout(beamTimeout);
    };
  }, [isRunning, pickCount]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none bg-[#0a1128]"
    >
      {/* 1. Nền thành phố & Bầu trời đêm */}
      <UfoCityBackground />

      {/* 2. Đĩa bay UFO xuất hiện từ trên cao, đồng hồ đếm ngược và cửa khoang */}
      <UfoSaucer
        capturedCount={capturedCount}
        targetCount={pickCount}
        isVisible={isUfoVisible}
        isBeaming={isBeaming}
        targetStudentPos={targetStudentPos}
        containerWidth={containerSize.width}
        countdownSeconds={countdownSeconds}
      />

      {/* 3. Toàn bộ học sinh chạy nhảy, nghiêng ngả, nhào lộn trên phố */}
      {studentSprites.map(item => (
        <UfoStudentSprite
          key={item.student.id}
          student={item.student}
          allStudents={students}
          x={item.x}
          y={item.y}
          vx={item.vx}
          isTargeted={item.isTargeted}
          isAbducted={item.isAbducted}
          isFallen={item.isFallen}
          speechQuote={item.speechQuote}
          gender={item.gender}
          rotation={item.rotation}
          opacity={item.opacity}
          scale={item.scale}
        />
      ))}
    </div>
  );
};
