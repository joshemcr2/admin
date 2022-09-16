import React, {useState, useEffect} from "react";
import { IconButton, Icon, Button, Grid,
  List,
  ListItem,
  ListItemText,
  TextField,
  Card,
} from "@material-ui/core";
import { Breadcrumb } from 'matx';
import ReactCountryFlag from "react-country-flag"
const slugify = require('slugify')
import { toast } from 'react-toastify';
import AssetMarkdown from "./AssetMarkdown";
import { useParams } from 'react-router-dom';
import AssetMeta from "./AssetMeta";
import { MatxLoading } from '../../../../matx';
import { ConfirmationDialog } from '../../../../matx';
import EditableTextField from '../../../components/EditableTextField';
import DialogPicker from '../../../components/DialogPicker';
import StatCard from "../components/StatCard"
import { PickCategoryModal } from "../components/PickCategoryModal"
import bc from 'app/services/breathecode';
import history from "history.js";
import { AsyncAutocomplete } from '../../../components/Autocomplete';
import CommentBar from "./CommentBar"
import {availableLanguages} from "../../../../utils"
const toastOption = {
  position: toast.POSITION.BOTTOM_RIGHT,
  autoClose: 8000,
};

const statusColors = {
  "DRAFT": "bg-error",
  "UNASSIGNED": "bg-error",
  "WRITING": "bg-warning",
  "PUBLISHED": "bg-primary",
}

const visibilityColors = {
  "PRIVATE": "bg-error",
  "UNLISTED": "bg-warning",
  "PUBLIC": "bg-primary",
}
const defaultAsset = {
  slug: "example-asset-slug",
  title: "Example asset title",
  seo_keywords: [],
  cluster: null,
  url: "",
  readme_url: "",
  lang: "us",
  status: 'DRAFT',
  visibility: 'PRIVATE',
  asset_type: null,
  owner: null,
  new: true,
}

const githubUrlRegex = /https:\/\/github\.com\/[\w\-_]+\/[\w\-_]+\/blob\/\w+\/[\w\-\/]+\.md$/g;
const slugRegex = /[\w\-_]+$/g;

const ComposeAsset = () => {

  const { asset_slug } = useParams();
  const isCreating = (asset_slug === undefined && (!asset || asset.id === undefined));
  const [ asset, setAsset ] = useState(defaultAsset);
  const [ updateVisibility, setUpdateVisibility ] = useState(false);
  const [ updateCategory, setUpdateCategory ] = useState(false);
  const [ updateStatus, setUpdateStatus ] = useState(false);
  const [ updateType, setUpdateType ] = useState(false);
  const [ updateLanguage, setUpdateLanguage ] = useState(false);
  const [ githubUrl, setGithubUrl ] = useState(null);
  const [ errors, setErrors] = useState({});
  const [ errorDialog, setErrorDialog] = useState(false);
  const [ content, setContent ] = useState(null);

  const partialUpdateAsset = async (newAsset) => {
    if(isCreating){
      toast.error("Please create the asset first", toastOption);
    }
    else{
      const resp = await bc.registry().updateAsset({ ...newAsset, slug: asset_slug });
      if (resp.status >= 200 && resp.status < 300) {
        setAsset(resp.data);
      }
    }
  }

  const getAssetContent = async () => {
    const resp = await bc.registry().getAssetContent(asset_slug, { frontmatter: false });
    if (resp.status >= 200 && resp.status < 300) {
      setContent(resp.data);
    }
  }

  useEffect(async () => {

    if(isCreating) {
      setAsset(defaultAsset);
      setGithubUrl(defaultAsset.readme_url);
      setContent("Write your asset here, use `markdown` syntax");
    }
    else{
      try{
        const resp = await bc.registry().getAsset(asset_slug);
        if (resp.status >= 200 && resp.status < 300) {
          setAsset({ ...resp.data, lang: resp.data.lang || "us" });
          setGithubUrl(resp.data.readme_url);
        }
        else throw Error('Asset could not be retrieved');
        
        await getAssetContent();
      }
      catch(error){
        console.log("Error log", error)
      }
    }

  }, [asset_slug]);

  const handleAction = async (action, payload=null) => {
    const resp = await bc.registry().assetAction(asset_slug, { ...payload, silent: true, action_slug:action });
    if(resp.status === 200){
      if((action=="sync" && resp.data.sync_status != 'OK')){ 
        toast.error(`Sync returned with problems: ${resp.data.status_text}`)
      }
      else if (action=="test" && resp.data.test_status != 'OK'){
        toast.error(`Integrity test returned with problems: ${resp.data.status_text}`)
      }
      else if (action=="analyze_seo"){
        // do nothing
      }
      else toast.success(`${action} completed successfully`)
      setAsset(resp.data)
      await getAssetContent();
    }
  }

  const hasErrors = (_asset) => {
    let _errors = {}
    if(!githubUrlRegex.test(_asset.readme_url)) _errors['readme_url'] = "The url must point to a markdown file on github usually starting with: https://github.com/[username]/[repo_name]/blob..."
    if(!slugRegex.test(_asset.slug)) _errors['slug'] = `Invalid slug, it can only contain letters, numbers - and _`;
    if(!_asset.owner) _errors['owner'] = "Please pick a github owner"
    if(!_asset.asset_type) _errors['asset_type'] = "Choose an asset type"
    if(!isCreating && !['OK', 'WARNING'].includes(_asset.sync_status)) _errors['sync_status'] = "Fix github synching";
    if(!isCreating && !['OK', 'WARNING'].includes(_asset.test_status)) _errors['test_status'] = "Integrity tests failed";
    console.log("validate", _asset)
    return _errors
  }
  
  const saveAsset = async () => {
    
    const readme_url = githubUrl || asset.readme_url;
    const _asset = { 
      ...asset, 
      readme_url,
      owner: asset.owner.id,
      readme: btoa(content), 
      url: !['PROJECT', 'EXERCISE'].includes(asset.asset_type) ?  readme_url : readme_url.substring(0, readme_url.indexOf("/blob/"))
    };

    const _errors = hasErrors(_asset);
    setErrors(_errors);
    
    if(Object.keys(_errors).length == 0){
      const action = isCreating ? "createAsset" : "updateAsset";
      
      const resp = await bc.registry()[action](_asset);
      if(resp.status >= 200 && resp.status < 300){
        if(isCreating) history.push(`./${resp.data.slug}`);
        else setAsset(resp.data)
        return true;
      }
      else if(resp.status >= 400 && resp.status < 500){
        return { "details": resp.data.details }
      }
      else return { "details": "There was an error saving the asset" }
    }else return _errors;

  }

  const handleUpdateCategory = async (category) => {
    if(category) partialUpdateAsset({ category: category.id || category })
    setUpdateCategory(false);
  }

  if(!asset) return <MatxLoading />;

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <div className="flex flex-wrap justify-between mb-6">
          <div>
            <Breadcrumb
              routeSegments={[{ name: 'Assets', path: '/media/asset' }, { name: 'Single Asset' }]}
            />
          </div>
        </div>
      </div>
    {asset.readme_url === "" ? 
      <Card className="p-4 mt-4">
        <h1>Create a new asset</h1>
        <p className="p-0 m-0">Select an asset type: 
            <Button size="small" variant="outlined" color="primary" className="ml-3"
              onClick={() => {
                setUpdateType(true)
                setErrors({ ...errors, asset_type: null })
              }}
            >{(asset && asset.asset_type) ? asset.asset_type : `Click to select`}</Button>
        </p>
        {errors["asset_type"] && <small className="text-error">{errors["asset_type"]}</small>}
        <p>Please provied a Github URL to fetch the markdown file from:</p>
        <TextField variant="outlined" size="small" value={githubUrl} fullWidth={true} onChange={(e) => {
          setGithubUrl(e.target.value)
          setErrors({ ...errors, readme_url: "" })
        }} placeholder="https://github.com/" />
        {errors["readme_url"] && <small className="text-error">{errors["readme_url"]}</small>}
        <p>Choose a slug for the asset</p>
        <TextField variant="outlined" size="small" value={asset.slug} fullWidth={true} onChange={(e) => {
          setAsset({ ...asset, slug: slugify(e.target.value.toLowerCase()) })
          setErrors({ ...errors, slug: "" })
        }} />
        {errors["slug"] && <small className="text-error">{errors["slug"]}</small>}
        <p>Github Owner (with read permissions on the repository):</p>
        <AsyncAutocomplete
            width="100%"
            size="small"
            onChange={(owner) => setAsset({ ...asset, owner })}
            label="Search among users"
            value={asset.owner}
            getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
            asyncSearch={(searchTerm) => bc.auth().getAllUsers({ github: true, like: searchTerm })}
        />
        {errors["owner"] && <small className="text-error">{errors["owner"]}</small>}
        <Button className="mt-2" variant="contained" color="primary"
          onClick={() => saveAsset()}
        >
          Create asset
        </Button>
      </Card>
        :
      <>
        <div className="flex flex-wrap justify-between mb-6">
          <Grid item xs={12} sm={8}>
            <EditableTextField defaultValue={asset.title} onChange={(_v) => {
              if(!isCreating) partialUpdateAsset({ title: _v });
              else setAsset({ ...asset, title: _v })
            }}>
              <h3 className="my-0 font-medium text-28">{asset.title}</h3>
            </EditableTextField>
            <EditableTextField defaultValue={asset.slug} 
            onValidate={async () => {
              const available = (await bc.registry().getAsset(slugify(asset.slug), { silent: true })).status === 404;
              setErrors({ ...errors, slug: available ? null : 'Slug already taken'});
              return available;
            }}
            onChange={(_v) => {
              if(!isCreating) partialUpdateAsset({ slug: slugify(_v) });
              else setAsset({ ...asset, slug: slugify(_v) })
            }}>
              <p className="my-0">{asset.slug}</p>

            </EditableTextField>
            
            <div className="flex">
              <div className={`px-3 text-11 py-3px border-radius-4 text-white ${statusColors[asset.status]} mr-3 pointer`}
                onClick={() => setUpdateStatus(true)}>
                {asset.status}
              </div>
              <div className={`px-3 text-11 py-3px border-radius-4 text-white ${visibilityColors[asset.visibility]} mr-3 pointer`}
                onClick={() => setUpdateVisibility(true)}
              >
                {asset.visibility}
              </div>
              <div className="px-3 text-11 py-3px border-radius-4 text-white bg-dark mr-3 pointer"
                onClick={() => {
                  setUpdateType(true)
                  setErrors({ ...errors, asset_type: null })
                }}
              >
                {asset.asset_type ? asset.asset_type : "NOT TYPE SPECIFIED"}
              </div>
              <div className="px-3 text-11 py-3px border-radius-4 text-white bg-dark mr-3 pointer"
                onClick={() => setUpdateCategory(true)}
              >
                {asset.category ? asset.category.slug || asset.category.title : 'Category'}
              </div>
              <div className="px-3 text-11 py-3px border-radius-4 text-dark bg-white mr-3 pointer"
                onClick={() => setUpdateLanguage(true)}
              >
                {availableLanguages[asset.lang] ? 
                  <>
                    <ReactCountryFlag className="mr-2" countryCode={asset.lang} svg />
                    {availableLanguages[asset.lang].toUpperCase()}
                  </>
                  : `Uknown language ${asset.lang}`}
              </div>
            </div>
            {errors["asset_type"] && <small className="text-error">{errors["asset_type"]}</small>}
          </Grid>

          <Grid item xs={6} sm={4} align="right">
            <CommentBar asset={asset} iconName="comment" title="Tasks and Comments" />
            <Button variant="contained" color={Object.keys(errors).length == 0 ? "primary": "error"}
              onClick={() => saveAsset().then(_errors => (Object.keys(errors).length > 0) && setErrorDialog(true))}
            >
              {isCreating ? `Create asset` : `Update content`}
            </Button>
          </Grid>
        </div>
        
        <Grid container spacing={3}>
          <Grid item md={8} xs={12}>
            <AssetMarkdown asset={asset} value={content} onChange={(c) => setContent(c)} />
          </Grid>
          <Grid item md={4} xs={12}>
            <AssetMeta asset={asset} onAction={(action, payload=null) => handleAction(action, payload)} onChange={a => partialUpdateAsset(a)} />
          </Grid>
        </Grid>
      </>
      }
      <DialogPicker
        onClose={opt => { 
          if(opt){
            if(isCreating) setAsset({ ...asset, visibility: opt })
            else partialUpdateAsset({ visibility: opt });
          }
          setUpdateVisibility(false)
        }}
        open={updateVisibility}
        title="Select a visibility"
        options={['PUBLIC', "UNLISTED", 'PRIVATE']}
      />
      <DialogPicker
        onClose={opt => { 
          if(opt){
            if(isCreating) setAsset({ ...asset, asset_type: opt })
            else partialUpdateAsset({ asset_type: opt });
          }
          setUpdateType(false)
        }}
        open={updateType}
        title="Select a type"
        options={['LESSON', "ARTICLE", 'PROJECT', 'EXERCISE', 'VIDEO', "QUIZ"]}
      />
      <DialogPicker
        onClose={opt => { 
          if(opt){
            if(isCreating) setAsset({ ...asset, status: opt })
            else partialUpdateAsset({ status: opt });
          }
          setUpdateStatus(false)
        }}
        open={updateStatus}
        title="Select a status"
        options={['UNASSIGNED', 'WRITING', 'DRAFT', 'PUBLISHED']}
      />
      <DialogPicker
        onClose={opt => {
          if(opt){
            if(isCreating) setAsset({ ...asset, lang: opt.value })
            else partialUpdateAsset({ lang: opt.value });
          } 
          setUpdateLanguage(false)
        }}
        open={updateLanguage}
        title="Select a language"
        options={Object.keys(availableLanguages).map(l => ({label: availableLanguages[l], value: l}))}
      />
      <ConfirmationDialog
        open={errorDialog}
        noLabel="Close"
        maxWidth="md"
        onConfirmDialogClose={() => setErrorDialog(false)}
        title="There are errors"
      >
      <List size="small">
        {Object.keys(errors).map((e,i) => 
          <ListItem key={i} size="small" className="p-0 m-0">
            <ListItemText className="capitalize" primary={errors[e]} />
          </ListItem>
        )}
      </List>
      </ConfirmationDialog>
      {updateCategory && <PickCategoryModal onClose={handleUpdateCategory} lang={asset.lang} defaultCategory={asset.category} />}
    </div>
  );
};

export default ComposeAsset;