const express = require('express')
const cors = require('cors');
const enableWs = require('express-ws')
const process = require('process');

function randomString() {
  return Math.random().toString(36).substring(7);
}

const port = 4582

const app = express()
app.use(cors())
app.options('*', cors())

let server = null;
if (process.argv.includes("--secure")) {
  console.log("HTTPS mode");
  var https = require('https');
  var fs = require("fs");
  var httpsOptions = {
    cert: fs.readFileSync("localhost.pem"),
    key: fs.readFileSync("localhost-key.pem"),
  }
  server = https.createServer(httpsOptions, app);
  enableWs(app, server);
} else {
  enableWs(app);
}

app.ws('/ws', (req, res) => {

})

const EXAMPLE_USER1_UUID = "example-user-1-uuid";
const EXAMPLE_USER1_HANDLE = "example-user-1";
const EXAMPLE_USER1_FULL_NAME = 'Example User 1';

const example_user1_preview = {
  uuid: EXAMPLE_USER1_UUID,
  handle: EXAMPLE_USER1_HANDLE,
  full_name: EXAMPLE_USER1_FULL_NAME,
  karma: 0
}

const EXAMPLE_USER2_UUID = 'example-user-2-uuid';
const EXAMPLE_USER2_HANDLE = 'example-user-2';

const example_user2_preview = {
  uuid: EXAMPLE_USER2_UUID,
  handle: EXAMPLE_USER2_HANDLE,
  full_name: null,
  karma: 2791
}

const EXAMPLE_SITE1_SUBDOMAIN = "internet-things";

const example_site1 = {
  description: "讨论互联网产品的设计和体验",
  uuid: "3noQmrdUbubY9ojPerYA",
  name: "互联网产品",
  subdomain: EXAMPLE_SITE1_SUBDOMAIN,
  public_readable: true,
  public_writable_question: true,
  public_writable_answer: true,
  public_writable_comment: true,
  create_question_coin_deduction: 2,
  addable_member: true,
  topics: [],
  moderator: example_user2_preview,
  permission_type: "public"
}

const randomSites = []
for (var i = 0; i < 20; i++) {
  const uuid = randomString();
  randomSites.push({
    description: `Random site ${uuid} description`,
    uuid: uuid + "-site-uuid",
    name: `Random site ${uuid}`,
    subdomain: uuid,
    public_readable: true,
    public_writable_question: true,
    public_writable_answer: true,
    public_writable_comment: true,
    create_question_coin_deduction: 2,
    addable_member: true,
    topics: [],
    moderator: example_user2_preview,
    permission_type: "public"
  })
}

const randomSiteProfiles = randomSites.map((ransomSite) => {
  return {
      "karma": 19,
      "owner": example_user1_preview,
      "site": ransomSite
  }
})

const randomUserPreviews = []
for (var i = 0; i < 20; i++) {
  const uuid = randomString();
  randomUserPreviews.push({
    uuid: uuid,
    handle: uuid + "_handle",
    full_name: uuid + " (FN)",
    karma: 0
  })
}

const example_question_preview = {
  "uuid": "6gpPVpfHJnEh4NfbZ4VY",
  "title": "Twitter, Facebook 类型的社交网络在未来会不会变成政府依靠税收运营的公共基础设施？",
  "description": null,
  "site": example_site1,
  "is_placed_at_site_top": false,
  "is_placed_at_home": false,
  "created_at": "2021-02-02T20:02:56.170487+00:00",
  "answers_count": 11
}

const example_answer1_preview = {
  "uuid": "3b4TBWxFUnBe4aRrKq4X",
  "author": example_user1_preview,
  "question": example_question_preview,
  "body": "我认为未来一段时间政府不会依靠税收运营社交网络。\n\n政府税收...",
  "upvotes_count": 2,
  "is_hidden_by_moderator": false,
  "is_placed_at_question_top": false
}

const EXAMPLE_USER1_SUBMISSION1_UUID = 'example-user1-submission1';

const example_user2_comment1 = {
  "uuid": "example-comment-1-uuid",
  "updated_at": "2021-03-05T20:17:40.139503+00:00",
  "body": "这是一条测试评论\n",
  "shared_to_timeline": true,
  "is_deleted": false,
  "upvotes_count": 1,
  "author": example_user2_preview,
  "root_route": `/submissions/${EXAMPLE_USER1_SUBMISSION1_UUID}`,
  "upvoted": false
}

const example_user1_submission1 = {
  "uuid": EXAMPLE_USER1_SUBMISSION1_UUID,
  "title": "知乎提交赴美 IPO 申请",
  "description": "\n",
  "url": "https://readhub.cn/topic/84nlE5nwJaO",
  "created_at": "2021-03-05T19:30:54.694708+00:00",
  "updated_at": "2021-03-05T19:30:57.482069+00:00",
  "topics": [],
  "upvotes_count": 0,
  "author": example_user1_preview,
  "comments": [example_user2_comment1],
  "site": {
    "description": "讨论互联网产品的设计和体验",
    "uuid": "3noQmrdUbubY9ojPerYA",
    "name": "互联网产品",
    "subdomain": "internet-things",
    "public_readable": true,
    "public_writable_question": true,
    "public_writable_answer": true,
    "public_writable_comment": true,
    "create_question_coin_deduction": 2,
    "addable_member": true,
    "topics": [],
    "auto_approval": true,
    "min_karma_for_application": null,
    "email_domain_suffix_for_application": "",
    "moderator": example_user1_preview,
    "permission_type": "public",
    "questions_count": 6,
    "submissions_count": 4,
    "members_count": 7
  },
  "upvoted": false,
  "view_times": 2
};

const example_comment_submission_activity = {
  "id": 2649,
  "site_uuid": null,
  "created_at": "2021-03-05T20:17:40.139503+00:00",
  "verb": "comment_submission",
  "content": null,
  "event": {
    "created_at": "2021-03-05T20:17:40.139503+00:00",
    "content": {
      "verb": "comment_submission",
      "subject": example_user2_preview,
      "comment": example_user2_comment1,
      "submission": example_user1_submission1,
    }
  }
}


const exmaple_create_submission_activity = {
  "id": 2650,
  "site_uuid": null,
  "created_at": "2021-03-05T20:19:07.513861+00:00",
  "verb": "create_submission",
  "content": null,
  "event": {
    "created_at": "2021-03-05T20:19:07.513861+00:00",
    "content": {
      "verb": "create_submission",
      "subject": example_user1_preview,
      "submission": example_user1_submission1
    }
  }
};

const example_activity = {
  "id": 1393,
  "site_uuid": null,
  "created_at": "2021-02-06T20:31:09.965902+00:00",
  "verb": "answer_question",
  "content": null,
  "event": {
      "created_at": "2021-02-06T20:31:09.965902+00:00",
      "content": {
          "verb": "answer_question",
          "subject": example_user1_preview,
          "answer": example_answer1_preview,
      }
  }
}

const example_activity_upvote_question1 = {
  "id": 1394,
  "site_uuid": null,
  "created_at": "2021-02-06T20:31:09.965902+00:00",
  "verb": "upvote_question",
  "content": null,
  "event": {
      "created_at": "2021-02-06T20:31:09.965902+00:00",
      "content": {
          "verb": "upvote_question",
          "subject": example_user1_preview,
          "question": example_question_preview,
      }
  }
}


const example_activity_upvote_question2 = {
  "id": 1395,
  "site_uuid": null,
  "created_at": "2021-02-06T20:31:09.965902+00:00",
  "verb": "upvote_question",
  "content": null,
  "event": {
      "created_at": "2021-02-06T20:31:09.965902+00:00",
      "content": {
          "verb": "upvote_question",
          "subject": example_user2_preview,
          "question": example_question_preview,
      }
  }
}

const example_topic1 = {
  "name": "china",
  "uuid": "6XHSzcdDhaiyAwBd7V3N",
  "parent_topic_uuid": null
};

const example_topic2 = {
  "name": "history",
  "uuid": "5yzVWVpeBcSn22Eck8T4",
  "parent_topic_uuid": null
};

app.post("/api/v1/ws/token", (req, res) => {
  res.json({
    msg: "example-ws-token",
  })
})

app.post("/api/v1/login/access-token", (req, res) => {
  res.json({
    access_token: 'access-token'
  })
})

app.get("/api/v1/me/moderated-sites/", (req, res) => {
  res.json([]);
})

app.get("/api/v1/sitemaps/", (req, res) => {
  res.json({
    site_maps: [],
    sites_without_topics: [],
  })
})

const userProfile = {
  id: 1,
  uuid: "example-uuid",
  email: "test@cha.fan",
  is_active: true,
  is_superuser: false,
  handle: "test",
  moderated_sites: [],
  subscribed_topics: [],
  residency_topics: [],
  profession_topic: {
    uuid: "topic1",
    name: "Topic 1",
  },
  remaining_coins: 12,
  view_times: 10,
  enable_deliver_unread_notifications: true,
}

app.get("/api/v1/me", (req, res) => {
  res.json(userProfile);
})


app.put("/api/v1/me", (req, res) => {
  res.json(userProfile);
})

app.get("/api/v1/me/site-profiles/", (req, res) => {
  res.json(randomSiteProfiles);
})

example_answer1 = {
  "uuid": "3b4TBWxFUnBe4aRrKq4X",
  "updated_at": "2021-02-06T20:37:28.104656+00:00",
  "body": "我认为未来一段时间政府不会依靠税收运营社交网络。\n\n政府税收运营对社交网路有两点影响。\n\n- 对公司决策产生制约\n- 对这些公司全球化有负面效应\n\n因此只有当大公司开始有衰退迹象并且做不好全球化的时候才会让政府当冤大头。未来一段时间还看不到这个现象。\n",
  "is_published": true,
  "draft_saved_at": null,
  "editor": "wysiwyg",
  "math_enabled": false,
  "source_format": "markdown",
  "upvotes_count": 2,
  "is_hidden_by_moderator": false,
  "is_placed_at_question_top": false,
  "comments": [],
  "author": example_user1_preview,
  "question": example_question_preview,
  "site": example_site1,
  "upvoted": true,
  "comment_writable": true,
  "bookmark_count": 0,
  "bookmarked": false,
  "view_times": 4
}


app.get("/api/v1/me/article-columns/", (req, res) => {
  res.json([]);
})

app.get("/api/v1/submissions/", (req, res) => {
  res.json([]);
})

app.get("/api/v1/me/pending-questions/", (req, res) => {
  res.json([]);
})

app.get(`/api/v1/people/${EXAMPLE_USER1_HANDLE}`, (req, res) => {
  res.json({
    "uuid": EXAMPLE_USER1_UUID,
    "handle": EXAMPLE_USER1_HANDLE,
    "full_name": EXAMPLE_USER1_FULL_NAME,
    "avatar_url": "https://d1z8mw8ytlamc2.cloudfront.net/76d28de05095ca51226adf2e1a8e3a6c197aa452df29d2b492cb0e9aa4f52acc",
    "personal_introduction": "Hahaha",
    "karma": 19,
    "gif_avatar_url": null,
    "answers_count": 1,
    "submissions_count": 2,
    "questions_count": 2,
    "articles_count": 0,
    "profiles": randomSiteProfiles,
    "profile_view_times": 0,
    "residency_topics": [ example_topic2 ],
    "profession_topic": example_topic1,
    "github_username": null,
    "twitter_username": null,
    "linkedin_url": null,
    "homepage_url": null,
    "subscribed_topics": [
      example_topic1, example_topic2
    ]
  })
})

app.get(`/api/v1/people/${EXAMPLE_USER1_UUID}/articles/`, (req, res) => { res.json([]) })
app.get(`/api/v1/people/${EXAMPLE_USER1_UUID}/answers/`, (req, res) => { res.json([]) })
app.get(`/api/v1/people/${EXAMPLE_USER1_UUID}/followers/`, (req, res) => {
  res.json(randomUserPreviews)
})
app.get(`/api/v1/people/${EXAMPLE_USER1_UUID}/followed/`, (req, res) => { res.json([]) })
app.get(`/api/v1/people/${EXAMPLE_USER1_UUID}/questions/`, (req, res) => { res.json([]) })
app.get(`/api/v1/people/${EXAMPLE_USER1_UUID}/submissions/`, (req, res) => { res.json([]) })

app.get(`/api/v1/people/${EXAMPLE_USER1_UUID}/edu-exps/`, (req, res) => {
  res.json([
    {
        "school_topic": example_topic1,
        "level": "bachelor"
    }
  ]);
})

app.get(`/api/v1/people/${EXAMPLE_USER1_UUID}/work-exps/`, (req, res) => {
  res.json([
      {
          "company_topic": example_topic1,
          "position_topic": example_topic2
      }
  ]);
});

app.get(`/api/v1/me/follows/${EXAMPLE_USER1_UUID}`, (req, res) => {
  res.json({
    user_uuid: EXAMPLE_USER1_UUID,
    followers_count: 3,
    followed_count: 4,
    followed_by_me: true,
  })
})

for (const userPrview of randomUserPreviews) {
  app.get(`/api/v1/me/follows/${userPrview.uuid}`, (req, res) => {
    res.json({
      user_uuid: userPrview.uuid,
      followers_count: 3,
      followed_count: 4,
      followed_by_me: true,
    })
  })
}

app.get(`/api/v1/me/follows/${EXAMPLE_USER2_UUID}`, (req, res) => {
  res.json({
    user_uuid: EXAMPLE_USER2_UUID,
    followers_count: 1,
    followed_count: 2,
    followed_by_me: false,
  })
})

app.get("/api/v1/answers/3b4TBWxFUnBe4aRrKq4X", (req, res) => {
  res.json(example_answer1)
});

app.get("/api/v1/reactions/answer/3b4TBWxFUnBe4aRrKq4X", (req, res) => {
  res.json({
    counters: {},
    my_reactions: [],
  })
});

app.post("/api/v1/answers/3b4TBWxFUnBe4aRrKq4X/views/", (req, res) => {

});

app.get("/api/v1/activities/", (req, res) => {
  if(req.query.before_activity_id === undefined) {
    res.json([
      example_activity,
      example_activity_upvote_question1,
      example_activity_upvote_question2,
      example_comment_submission_activity,
      exmaple_create_submission_activity,
    ]);
  } else {
    res.json([]);
  }
})

app.get(`/api/v1/sites/${EXAMPLE_SITE1_SUBDOMAIN}`, (req, res) => {
  res.json(example_site1)
})

for (const site of randomSites) {
  app.get(`/api/v1/sites/${site.subdomain}`, (req, res) => {
    res.json(site)
  })
}

app.get("/api/v1/notifications/unread/", (req, res) => {
  res.json([]);
})

app.get("/api/v1/home/questions/", (req, res) => {
  res.json([]);
})

if (server) {
  server.listen(port, () => {
    console.log(`Example app listening at https://localhost:${port}`);
  })
} else {
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
}