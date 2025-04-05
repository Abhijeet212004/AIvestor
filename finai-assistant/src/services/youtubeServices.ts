// YouTube API service for fetching educational videos
const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY || 'AIzaSyCVLt6lrrgZWhDofV_w9CqniOmb0nFm0Ag'; // Get from environment variable
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Define skill level-specific topics and terms for more targeted results
const skillLevelTopics = {
  Beginner: {
    topics: [
      'investing basics',
      'stock market for beginners',
      'personal finance fundamentals',
      'investment types explained',
      'beginner investing guide',
      'what is a stock',
      'how to start investing',
      'investing terminology'
    ],
    excludeTerms: 'advanced,technical analysis,day trading,options'
  },
  Intermediate: {
    topics: [
      'investment strategies',
      'portfolio diversification',
      'fundamental analysis',
      'dividend investing',
      'ETF investing strategies',
      'value investing',
      'growth investing',
      'investment risk management'
    ],
    excludeTerms: 'beginner,introduction,basics'
  },
  Advanced: {
    topics: [
      'technical analysis',
      'options trading',
      'derivatives explained',
      'advanced portfolio management',
      'quantitative investing',
      'financial statement analysis',
      'hedge fund strategies',
      'risk arbitrage',
      'advanced market concepts'
    ],
    excludeTerms: 'beginner,introduction,basics'
  }
};

interface VideoItem {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
    channelTitle: string;
    publishedAt: string;
  };
}

interface VideoSearchResponse {
  items: VideoItem[];
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  url: string;
  levelRelevance: number; // Added to indicate how relevant to the current level
}

/**
 * Get relevant financial education videos based on level and query
 * @param level 'Beginner' | 'Intermediate' | 'Advanced'
 * @param query Additional search terms to narrow down results
 * @param maxResults Maximum number of videos to return
 * @returns Promise with array of video results
 */
export const getEducationalVideos = async (
  level: 'Beginner' | 'Intermediate' | 'Advanced',
  query: string = '',
  maxResults: number = 6
): Promise<Video[]> => {
  // Select a topic based on the level, or use default topic if no match
  const levelConfig = skillLevelTopics[level] || skillLevelTopics.Beginner;
  
  // If user provided a specific query, use it with level-specific qualifiers
  // Otherwise, select a random topic from the level-specific topics
  let combinedQuery = query 
    ? `${level} ${query} investing finance education` 
    : `${level} ${levelConfig.topics[Math.floor(Math.random() * levelConfig.topics.length)]}`;
  
  try {
    // Add exclusion terms to avoid content for inappropriate levels  
    const excludeTerms = levelConfig.excludeTerms ? `&excludeTerms=${levelConfig.excludeTerms}` : '';
    
    // Enhanced API request with more parameters for better targeting
    const response = await fetch(
      `${YOUTUBE_API_BASE_URL}/search?part=snippet&q=${encodeURIComponent(combinedQuery)}${excludeTerms}&maxResults=${maxResults * 2}&type=video&relevanceLanguage=en&videoDuration=medium&videoEmbeddable=true&key=${YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch videos from YouTube API');
    }
    
    const data: VideoSearchResponse = await response.json();
    
    // Additional filtering to ensure quality results
    const videos = data.items
      .filter(item => 
        // Filter out videos with generic or misleading titles
        !item.snippet.title.toLowerCase().includes('scam') &&
        !item.snippet.title.toLowerCase().includes('get rich quick')
      )
      .map(item => {
        // Calculate level relevance score based on title and description
        const titleLower = item.snippet.title.toLowerCase();
        const descLower = item.snippet.description.toLowerCase();
        const combinedText = `${titleLower} ${descLower}`;
        
        // Calculate relevance based on how many level-specific terms appear in content
        let levelRelevance = combinedText.includes(level.toLowerCase()) ? 10 : 0;
        
        // Check for topic matches
        levelConfig.topics.forEach(topic => {
          if (combinedText.includes(topic.toLowerCase())) {
            levelRelevance += 5;
          }
        });
        
        // Check for excluded terms
        if (levelConfig.excludeTerms) {
          levelConfig.excludeTerms.split(',').forEach(term => {
            if (combinedText.includes(term.toLowerCase())) {
              levelRelevance -= 5;
            }
          });
        }
        
        return {
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.medium.url,
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          levelRelevance
        };
      })
      // Sort by level relevance and return top results
      .sort((a, b) => b.levelRelevance - a.levelRelevance)
      .slice(0, maxResults);
    
    return videos;
  } catch (error) {
    console.error('Error fetching educational videos:', error);
    return [];
  }
};

/**
 * Get videos from specifically curated educational playlists
 * @param level Skill level to filter by
 * @returns Promise with video results
 */
export const getCuratedEducationalVideos = async (
  level: 'Beginner' | 'Intermediate' | 'Advanced'
): Promise<Video[]> => {
  // Curated playlist IDs for different skill levels
  const playlistIds = {
    Beginner: 'PL8uhW8cclCs4sjhnBGnFfA34JzpS7cYFy', // Two Cents: Personal Finance Basics
    Intermediate: 'PLI84Sf1yi0RRWGJ4f_6EqFFpFLm8m4lQq', // The Plain Bagel: Investment Fundamentals
    Advanced: 'PL0yJLUak0QxhuxDLEHGqUDg2idQmJ9Q_2'  // Patrick Boyle: Advanced Trading
  };
  
  const playlistId = playlistIds[level] || playlistIds.Beginner;
  
  try {
    // Get playlist items
    const response = await fetch(
      `${YOUTUBE_API_BASE_URL}/playlistItems?part=snippet&maxResults=10&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch videos from curated playlist');
    }
    
    const data = await response.json();
    
    return data.items.map((item: any) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium?.url || '',
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
      levelRelevance: 10 // Curated content is highly relevant
    }));
  } catch (error) {
    console.error('Error fetching curated videos:', error);
    return [];
  }
};

/**
 * Get personalized video recommendations based on user's skill level
 * @param level User's skill level: 'Beginner' | 'Intermediate' | 'Advanced'
 * @param interests Optional array of user interests to further personalize recommendations
 * @returns Promise with video results tailored to the user's level
 */
export const getPersonalizedRecommendations = async (
  level: 'Beginner' | 'Intermediate' | 'Advanced',
  interests: string[] = []
): Promise<Video[]> => {
  try {
    // Create a personalized query based on user's interests if available
    let personalizedQuery = '';
    
    if (interests && interests.length > 0) {
      // Combine up to 3 interests to avoid too specific queries
      personalizedQuery = interests.slice(0, 3).join(' ');
    }
    
    // Get videos specific to user's level and interests
    const videos = await getEducationalVideos(level, personalizedQuery, 8);
    
    return videos;
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return [];
  }
};

export default {
  getEducationalVideos,
  getCuratedEducationalVideos,
  getPersonalizedRecommendations
};