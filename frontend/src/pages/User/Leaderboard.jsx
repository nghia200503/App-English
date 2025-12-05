import { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { useAuthStore } from '../../stores/useAuthStore';
import { assets } from '../../assets/assets';
import { Trophy, Crown, Medal, Star, Shield } from 'lucide-react';
import Header from '../../components/Header';

export default function Leaderboard() {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuthStore();

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await userService.getLeaderboard();
                if (response.success) {
                    setLeaders(response.data);
                }
            } catch (error) {
                console.error("Failed to load leaderboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const topThree = leaders.slice(0, 3);
    const restList = leaders.slice(3);

    // Component hiển thị Avatar Top 3
    const TopAvatar = ({ user, rank }) => {
        if (!user) return <div className="w-20 md:w-24"></div>; // Placeholder để giữ layout

        let borderColor = '';
        let crownColor = '';
        let heightClass = '';
        let glowClass = '';
        let badgeColor = '';

        if (rank === 1) {
            borderColor = 'border-yellow-400';
            crownColor = 'text-yellow-500';
            heightClass = 'h-40 md:h-48'; // Cao nhất
            glowClass = 'shadow-[0_0_30px_rgba(234,179,8,0.3)]'; // Glow vàng
            badgeColor = 'bg-yellow-500';
        } else if (rank === 2) {
            borderColor = 'border-slate-300';
            heightClass = 'h-32 md:h-36';
            badgeColor = 'bg-slate-400';
        } else {
            borderColor = 'border-amber-600';
            heightClass = 'h-28 md:h-32';
            badgeColor = 'bg-amber-700';
        }

        return (
            <div className={`flex flex-col items-center justify-end w-1/3 ${rank === 1 ? '-mt-10 z-10' : ''}`}>
                {/* Avatar Section */}
                <div className="relative mb-3 flex flex-col items-center">
                    {rank === 1 && (
                        <Crown className={`w-8 h-8 ${crownColor} fill-current animate-bounce mb-1`} />
                    )}
                    
                    <div className={`relative rounded-full p-1 bg-white ${glowClass}`}>
                        <img 
                            src={user.avatarUrl || assets.user_avatar} 
                            onError={(e) => e.target.src = assets.user_avatar}
                            className={`rounded-full object-cover border-4 ${borderColor} ${rank === 1 ? 'w-24 h-24 md:w-28 md:h-28' : 'w-16 h-16 md:w-20 md:h-20'}`}
                            alt={`Rank ${rank}`}
                        />
                        {/* Badge Level */}
                        <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 ${badgeColor} text-white text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm whitespace-nowrap`}>
                            Lv {user.level || 1}
                        </div>
                    </div>
                </div>

                {/* Name & XP */}
                <div className="text-center mb-2">
                    <p className={`font-bold text-gray-800 truncate max-w-[100px] md:max-w-[140px] ${rank === 1 ? 'text-lg' : 'text-sm'}`}>
                        {user.displayName}
                    </p>
                    <p className="text-blue-600 font-bold text-xs md:text-sm bg-blue-50 px-2 py-0.5 rounded-md inline-block mt-1">
                        {user.experiencePoints.toLocaleString()} XP
                    </p>
                </div>

                {/* Pedestal (Bục đứng) */}
                <div className={`w-full ${heightClass} rounded-t-lg relative overflow-hidden flex items-start justify-center pt-2 shadow-sm border-t border-white/50 backdrop-blur-sm
                    ${rank === 1 ? 'bg-gradient-to-b from-yellow-200 to-yellow-50/50' : ''}
                    ${rank === 2 ? 'bg-gradient-to-b from-slate-200 to-slate-50/50' : ''}
                    ${rank === 3 ? 'bg-gradient-to-b from-orange-200 to-orange-50/50' : ''}
                `}>
                    <span className={`text-4xl font-black opacity-30 
                        ${rank === 1 ? 'text-yellow-600' : ''}
                        ${rank === 2 ? 'text-slate-600' : ''}
                        ${rank === 3 ? 'text-orange-700' : ''}
                    `}>
                        {rank}
                    </span>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                    <p className="text-gray-500 font-medium">Đang tải bảng xếp hạng...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-10">
            <Header />
            
            <div className="max-w-3xl mx-auto px-4 py-8">
                
                {/* Header Title */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 bg-yellow-100 rounded-2xl mb-4 shadow-sm">
                        <Trophy className="text-yellow-600 w-8 h-8 fill-yellow-600" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Bảng Xếp Hạng</h1>
                    <p className="text-gray-500 mt-2 font-medium">Vinh danh những học viên xuất sắc nhất tuần này</p>
                </div>

                {/* Podium Section (Top 3) */}
                {topThree.length > 0 && (
                    <div className="flex justify-center items-end gap-2 md:gap-4 mb-8 bg-white/50 p-6 rounded-3xl border border-white shadow-xl shadow-slate-200/50">
                        {/* Hạng 2 */}
                        <TopAvatar user={topThree[1]} rank={2} />
                        
                        {/* Hạng 1 */}
                        <TopAvatar user={topThree[0]} rank={1} />
                        
                        {/* Hạng 3 */}
                        <TopAvatar user={topThree[2]} rank={3} />
                    </div>
                )}

                {/* List Ranking (4+) */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Thứ hạng</span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Điểm tích lũy</span>
                    </div>
                    
                    <div className="divide-y divide-gray-50">
                        {restList.map((user, index) => {
                            const rank = index + 4;
                            const isMe = currentUser && currentUser._id === user._id;
                            
                            return (
                                <div 
                                    key={user._id} 
                                    className={`flex items-center justify-between p-4 hover:bg-blue-50/50 transition-colors group ${isMe ? 'bg-blue-50 ring-1 ring-blue-200 z-10 relative' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 flex justify-center">
                                            <span className="font-bold text-gray-400 text-sm group-hover:text-blue-500 transition">#{rank}</span>
                                        </div>
                                        
                                        <div className="relative">
                                            <img 
                                                src={user.avatarUrl || assets.user_avatar} 
                                                onError={(e) => e.target.src = assets.user_avatar}
                                                className="w-10 h-10 rounded-full object-cover border border-gray-200 group-hover:border-blue-300 transition"
                                                alt={user.displayName}
                                            />
                                            {/* Level Badge nhỏ */}
                                            <div className="absolute -bottom-1 -right-2 bg-gray-800 text-white text-[9px] px-1.5 py-0.5 rounded-full border border-white">
                                                Lv{user.level || 1}
                                            </div>
                                        </div>

                                        <div className="flex flex-col">
                                            <span className={`font-bold text-sm ${isMe ? 'text-blue-700' : 'text-gray-800'}`}>
                                                {user.displayName} {isMe && <span className="text-xs font-normal text-blue-500 bg-blue-100 px-1.5 py-0.5 rounded ml-1">(Bạn)</span>}
                                            </span>
                                            <span className="text-xs text-gray-400">@{user.username}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg group-hover:bg-white group-hover:shadow-sm transition">
                                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                        <span className="font-bold text-gray-700 text-sm">{user.experiencePoints.toLocaleString()}</span>
                                    </div>
                                </div>
                            );
                        })}

                        {leaders.length === 0 && (
                            <div className="p-12 text-center flex flex-col items-center">
                                <Shield size={48} className="text-gray-200 mb-3" />
                                <p className="text-gray-500 font-medium">Chưa có dữ liệu bảng xếp hạng.</p>
                                <p className="text-gray-400 text-sm">Hãy là người đầu tiên ghi tên lên bảng vàng!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}