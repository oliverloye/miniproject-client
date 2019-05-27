import React from "react";

import ApolloClient from "apollo-boost";
import { ApolloProvider, Query, Mutation } from "react-apollo";
import gql from "graphql-tag";

const client = new ApolloClient({
	uri: "http://localhost:4000/"
});

const GET_BLOGS = gql`
	{
		blogs {
			_id
			info
			author{
				_id
				userName
			}
			img
			pos{
				longitude
				latitude
			}
			likedBy{
				_id
				userName
			}
			created
			lastUpdated
		}
	}
`;

const ADD_BLOG = gql`
	mutation AddLocationBlog($info: String!, $pos: PosInput!, $author: String!) {
		addLocationBlog(info: $info, pos: $pos, author: $author) {
			_id
			info
			author{
				_id
				userName
			}
			img
			pos{
				longitude
				latitude
			}
			likedBy{
				_id
				userName
			}
			created
			lastUpdated
		}
	}
`;

const LIKE_BLOG = gql`
	mutation LikeLocationBlog($userName: String!, $blogId: String!){
		likeLocationBlog(userName: $userName, blogId: $blogId){
			info
			author{
				_id
				userName
			}
			img
			pos{
				longitude
				latitude
			}
			likedBy{
				_id
				userName
			}
			created
			lastUpdated
		}
	}
`;

const Blogs = () => {
	let input;
	return (
		<Query query={GET_BLOGS}>
			{({ loading, error, data }) => {
				if (loading) return <p>Loading...</p>;
				if (error) return <p>Error :(</p>;

				return data.blogs.map(({ _id, info, pos, author, img, likedBy }) => {

					return (
						<div key={_id}>
							<h3>{info}</h3>
							<h5>position: {pos.longitude},{pos.latitude}</h5>
							<p>Author: {author.userName}</p>
							<img src={img} alt="what a nice place"></img>
							{likedBy.map(user => <p key={user._id}>{user.userName} likes this place</p>)}
							<Mutation mutation={LIKE_BLOG}>
								{(likeLocationBlog, { loading, error }) => {
									if (loading) return <p>Loading...</p>;

									return (
										<div>
										<form
											onSubmit = { e => {
												likeLocationBlog({ variables: { userName: input.value, blogId: _id} }); /* normally, it would like with the logged in user */
												input.value = "";
											}}
										>
										<input
											placeholder = "like from username"
											ref = {node => { input = node; }}
										/>
											<button type="submit">LIKE</button>
										</form>
										</div>
									)
								}}
							</Mutation>
						</div>
					);
				});
			}}
		</Query>
	)
};

const AddBlog = () => {
	let info;
	let longitude;
	let latitude;
	let author;

	return (
		<Mutation mutation={ADD_BLOG}
			update={(cache, { data: { addLocationBlog } }) => {
				const { blogs } = cache.readQuery({ query: GET_BLOGS });
				cache.writeQuery({
					query: GET_BLOGS,
					data: { blogs: blogs.concat([addLocationBlog]) },
				});
			}}>
			{(addLocationBlog, { data, loading, error }) => (
				<div>
					<form
						align="center"
						onSubmit={e => {
							e.preventDefault();
							addLocationBlog({
								variables:
								{
									info: info.value,
									pos: {
										longitude: Number(longitude.value),
										latitude: Number(latitude.value)
									},
									author: author.value,
								}
							});
							info.value = "";
							longitude.value = "";
							latitude.value = "";
							author.value = "";
						}}
					>
						<input placeholder="info" ref={node => { info = node; }} /><br/>
						<input placeholder="longitude" ref={node => { longitude = node; }} /><br/>
						<input placeholder="latitude" ref={node => { latitude = node; }} /><br/>
						<input placeholder="author" ref={node => { author = node; }} /><br/>

						<button type="submit">Post blog</button>
					</form>
					{loading && <p>Loading...</p>}
					{error && <p>Error :( Please try again</p>}
				</div>
			)}
		</Mutation>
	);
};


const App = () => {
	return (
		<ApolloProvider client={client} >
			<div>
				<h2>Blogs</h2>
				<Blogs />
				
			</div>
		</ApolloProvider >
	)
};

export default App;

//<br/>
//<AddBlog />
