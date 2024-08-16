type onboardingSwiperDataType = {
  id: number;
  title: string;
  description: string;
  sortDescrition: string;
  sortDescrition2?: string;
  image: any;
};

type Avatar = {
  public_id: string;
  url: string;
};

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  code: string;
  year: number;
  birth_date: string;
  gender: string;
  address: string;
  national_id: string;
  gpa: string;
  profile_image: {
    id:number,
    name:string,
    url:string,
    desk:string
  } | null;
  should_reset_password: number;
  faculty: {
    id: number;
    name: string;
    code: string;
    years: number;
    type: string;
    is_active: number;
    translations: {
      name: {
        en: string;
        ar: string;
      };
    };
  };
  department: {
    id: number;
    name: string;
    year: number;
    is_active: number;
  };
  group: {
    id: number;
    name: string;
  };
  courses: Array<{
    id: number;
    name: string;
    code: string;
    start_year: number;
    hours: number;
    translations: {
      name: {
        ar: string;
      };
    };
    created_at: string;
  }>;
}



type BannerDataTypes = {
  bannerImageUrl: any;
};
type TranslationType = {
  title: { ar: string };
  description: { ar: string };
};

type CourseDetailType = {
  id: number;
  course_id: number;
  title: string;
  description: string;
  is_active: number;
  translations: TranslationType;
};

type CourseDataResponse = {
  message: string;
  data: {
    items: CourseDetailType[];
    total: number;
    page: number | null;
    limit: number | null;
  };
};

